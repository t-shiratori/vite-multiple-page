import p5 from 'p5';

type SpringArgs = {
  len: number;
  node_a: Node;
  node_b: Node;
  index: number;
  maxSpeed: number;
  maxForce: number;
  p5: p5;
};

/** ----------------------------------------------------------------
 * Spring
 * ---------------------------------------------------------------- */
class Spring {
  len;
  k;
  node_a;
  node_b;
  index;
  maxSpeed;
  maxForce;
  p5;
  constructor({
    node_a,
    node_b,
    len,
    index,
    maxSpeed,
    maxForce,
    p5,
  }: SpringArgs) {
    this.len = len;
    this.k = 0.01; // テンション
    this.node_a = node_a;
    this.node_b = node_b;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.index = index;
    this.p5 = p5;
  }

  getSteer = (
    target: Node,
    chaser: Node,
    maxSpeed: number,
    maxForce: number
  ) => {
    const desired = p5.Vector.sub(target.pos, chaser.pos);
    desired.normalize();
    desired.mult(maxSpeed * 2);
    const steer = p5.Vector.sub(desired, chaser.vel);
    steer.limit(maxForce * 5);
    return steer;
  };

  update = () => {
    const force = p5.Vector.sub(this.node_a.pos, this.node_b.pos);
    const dist = force.mag();
    const stretch = (dist - this.len) * 4;
    force.normalize();
    force.mult(-1 * this.k * stretch);
    const aSteer = this.getSteer(
      this.node_a,
      this.node_b,
      this.maxSpeed,
      this.maxForce
    );

    this.node_a.applyForce(force);

    force.mult(-1);

    this.node_b.applyForce(force);
    this.node_b.applyForce(aSteer.mult(1));
  };

  show = () => {
    this.p5.strokeWeight(2);
    this.p5.stroke(255, 100);
    this.p5.line(
      this.node_a.pos.x,
      this.node_a.pos.y,
      this.node_b.pos.x,
      this.node_b.pos.y
    );
  };
}

type NodeArgs = {
  size: number;
  x: number;
  y: number;
  c: p5.Color;
  p5: p5;
};

/** ----------------------------------------------------------------
 * Node
 * ---------------------------------------------------------------- */
class Node {
  size;
  pos;
  color;
  vel;
  force;
  dumping;
  mass;
  p5;
  constructor({ size, x, y, c, p5 }: NodeArgs) {
    this.size = size;
    this.pos = p5.createVector(x, y);
    this.color = c;
    this.vel = p5.createVector();
    this.force = p5.createVector();
    this.dumping = 0.97;
    this.mass = 8;
    this.p5 = p5;
  }

  applyForce = (f: p5.Vector) => {
    const cpf = f.copy();
    cpf.div(this.mass);
    this.force.add(cpf);
  };

  update = () => {
    this.vel.add(this.force);
    this.vel.mult(this.dumping);
    this.pos.add(this.vel);
    this.force.mult(0);
  };

  show = () => {
    this.p5.strokeWeight(1);
    this.p5.stroke(this.color);
    this.p5.noFill();
    this.p5.ellipse(this.pos.x, this.pos.y, this.size * 2, this.size * 2);
  };
}

type AgentArgs = {
  r: number;
  x: number;
  y: number;
  c: p5.Color;
  agents: Agent[];
  p5: p5;
};

/** ----------------------------------------------------------------
 * Agent
 * ---------------------------------------------------------------- */
class Agent {
  radius;
  pos;
  vel;
  force;
  color;
  maxSpeed;
  maxForce;
  jointNum;
  wanderTheta;
  nodes: Node[];
  springs;
  friction;
  p5;
  agents;

  constructor({ r, x, y, c, agents, p5 }: AgentArgs) {
    this.radius = r;
    this.pos = p5.createVector(x, y);
    this.vel = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
    this.force = p5.createVector();
    this.color = c;
    this.maxSpeed = p5.random(4, 8);
    this.maxForce = p5.random(0.05, 0.1);
    this.jointNum = 7;

    this.wanderTheta = 0;

    this.nodes = [];
    this.springs = [];

    this.friction = 0.97;

    this.agents = agents;

    this.p5 = p5;

    for (let i = 1; i <= this.jointNum; i++) {
      const c = p5.color(255, 255, 255);

      this.nodes.push(
        new Node({
          size: this.radius / i,
          x: this.pos.x,
          y: this.pos.y + i * 2,
          c: c,
          p5,
        })
      );
    }

    for (let i = 0; i < this.jointNum - 1; i++) {
      this.springs.push(
        new Spring({
          node_a: this.nodes[i],
          node_b: this.nodes[i + 1],
          len: 20,
          index: this.jointNum - i,
          maxSpeed: this.maxSpeed,
          maxForce: this.maxForce,
          p5,
        })
      );
    }
  }

  applyForce = (f: p5.Vector) => {
    this.force.add(f.copy());
  };

  seek = (target: p5.Vector) => {
    const desired = p5.Vector.sub(target, this.pos);
    desired.normalize();
    desired.mult(this.maxSpeed);
    const steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  };

  separate = () => {
    const desiredSeparation = this.radius * 2;
    const sum = this.p5.createVector();
    let count = 0;

    for (let i = 0; i < this.agents.length; i++) {
      const d = p5.Vector.dist(this.pos, this.agents[i].pos);
      if (d > 0 && d < desiredSeparation) {
        const diff = p5.Vector.sub(this.pos, this.agents[i].pos);
        diff.normalize();
        diff.div(d);
        sum.add(diff);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      const steer = p5.Vector.sub(sum, this.vel);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return this.p5.createVector();
    }
  };

  align = () => {
    const neihborDist = this.radius * 3;
    const sum = this.p5.createVector();
    let count = 0;

    for (let i = 0; i < this.agents.length; i++) {
      const d = p5.Vector.dist(this.pos, this.agents[i].pos);
      if (d > 0 && d < neihborDist) {
        sum.add(this.agents[i].vel);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      const steer = p5.Vector.sub(sum, this.vel);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return this.p5.createVector();
    }
  };

  choesion = () => {
    const neihborDist = this.radius * 2;
    const sum = this.p5.createVector();
    let count = 0;

    for (let i = 0; i < this.agents.length; i++) {
      const d = p5.Vector.dist(this.pos, this.agents[i].pos);
      if (d > 0 && d < neihborDist) {
        sum.add(this.agents[i].pos);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    } else {
      return this.p5.createVector();
    }
  };

  wander = () => {
    const wanderRadius = 60;
    const wanderDistance = 90;
    const range = 0.4;
    this.wanderTheta += this.p5.random(-range, range);

    const circleLoc = this.vel.copy();
    circleLoc.normalize();
    circleLoc.mult(wanderDistance);
    circleLoc.add(this.pos);
    const h = this.vel.heading();
    const angle = this.wanderTheta + h;
    const circleOffset = this.p5.createVector(
      wanderRadius * this.p5.cos(angle),
      wanderRadius * this.p5.sin(angle)
    );
    const target = p5.Vector.add(circleLoc, circleOffset);
    return this.seek(target);
  };

  update = () => {
    const wander = this.wander();
    const sep = this.separate();
    const ali = this.align();
    const cho = this.choesion();

    this.applyForce(wander);
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(cho);

    this.vel.add(this.force);
    this.vel.mult(this.friction);
    this.pos.add(this.vel);

    for (let i = 0; i < this.springs.length; i++) {
      this.springs[i].update();
    }

    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].update();
    }

    this.border();
    this.force.mult(0);
  };

  border = () => {
    if (this.pos.x - this.radius <= 0) {
      this.pos.x = this.radius;
      this.vel.x *= -0.5;
    }
    if (this.pos.x + this.radius >= this.p5.windowWidth) {
      this.pos.x = this.p5.windowWidth - this.radius;
      this.vel.x *= -0.5;
    }
    if (this.pos.y - this.radius <= 0) {
      this.pos.y = this.radius;
      this.vel.y *= -0.5;
    }
    if (this.pos.y + this.radius >= this.p5.windowHeight) {
      this.pos.y = this.p5.windowHeight - this.radius;
      this.vel.y *= -0.5;
    }
  };

  show = () => {
    this.nodes[0].pos.x = this.pos.x;
    this.nodes[0].pos.y = this.pos.y;

    // 節
    for (var i = 0; i < this.nodes.length; i++) {
      this.nodes[i].show();

      // ひれ
      this.p5.push();
      this.p5.translate(this.nodes[i].pos.x, this.nodes[i].pos.y);

      if (i === 0) {
        this.p5.rotate(this.vel.heading());
      } else {
        this.p5.rotate(this.nodes[i].vel.heading());
      }

      const vx = -3 * (this.nodes.length - i + 2);

      const wingLength = 12;
      const perWing =
        (1 - (this.vel.mag() * 4) / wingLength) * (wingLength + this.maxSpeed);

      this.p5.line(0, 0, vx, perWing);
      this.p5.line(0, 0, vx, -1 * perWing);
      this.p5.pop();
    }

    // 背骨
    for (let i = 0; i < this.springs.length; i++) {
      this.springs[i].show();
    }

    // 頭
    this.p5.push();
    this.p5.translate(this.pos.x, this.pos.y);
    this.p5.rotate(this.vel.heading());
    this.p5.strokeWeight(2);
    this.p5.line(0, 0, this.radius, 0);
    this.p5.pop();
  };
}

/** ----------------------------------------------------------------
 * sketch
 * ---------------------------------------------------------------- */
const sketch = (p5: p5) => {
  const agents: Agent[] = [];

  p5.setup = () => {
    p5.background(0, 0, 0);
    const screen_w = p5.windowWidth;
    const screen_h = p5.windowHeight;
    p5.createCanvas(screen_w, screen_h);

    // エージェントを作成
    for (let i = 0; i < 20; i++) {
      const c = p5.color(
        p5.random(50, 255),
        p5.random(50, 255),
        p5.random(50, 255),
        255
      );
      const x = p5.random(screen_w - 30) + 30;
      const y = p5.random(screen_h - 30) + 30;
      const r = 20;
      const agent = new Agent({ r, x, y, c, agents, p5 });
      agents.push(agent);
    }
  };

  p5.draw = () => {
    p5.background(0, 0, 0);

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      agent.wander();
      agent.update();
      agent.show();
    }
  };

  p5.windowResized = () => {
    const screen_w = p5.windowWidth;
    const screen_h = p5.windowHeight;
    p5.resizeCanvas(screen_w, screen_h);
    p5.background(0, 0, 0);
  };
};

new p5(sketch);
