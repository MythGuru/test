/* TikTok Famous: physics (arm IK with collision, hand aim, ponytail verlet, springs, separation) */
(function () {
  const MV = window.MV, U = MV.U;
  const PH = (MV.phys = {});
  const V3 = () => new THREE.Vector3();
  const _S = V3(), _T = V3(), _d = V3(), _u = V3(), _n = V3(), _f = V3(), _x = V3(), _y = V3(), _z = V3(), _E = V3(), _tmp = V3(), _tmp2 = V3();
  const _M = new THREE.Matrix4(), _q = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion();
  const UP = new THREE.Vector3(0, 1, 0), DOWN = new THREE.Vector3(0, -1, 0);

  // ---------------------------------------------------------------- two-bone arm IK
  // Returns the world-space shoulder quaternion and elbow bend that put the palm on `target`.
  function solveArm(J, side, target, pole, outQ) {
    const G = MV.chars.G;
    const k = side > 0 ? 'l' : 'r', sh = J[k + 'Sh'];
    const L1 = G.upper, L2 = G.fore + 0.28;
    sh.getWorldPosition(_S);
    _d.subVectors(target, _S);
    const dist = U.clamp(_d.length(), 0.35, L1 + L2 - 0.02);
    _d.normalize();
    const a = Math.acos(U.clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1));
    _n.crossVectors(_d, pole);
    if (_n.lengthSq() < 1e-6) _n.crossVectors(_d, _tmp.set(side, 0, 0));
    _n.normalize();
    _tmp.crossVectors(_n, _d).normalize();
    _u.copy(_d).multiplyScalar(Math.cos(a)).addScaledVector(_tmp, Math.sin(a)).normalize();
    const bend = Math.PI - Math.acos(U.clamp((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1));
    _E.copy(_S).addScaledVector(_u, L1);
    _f.copy(_S).addScaledVector(_d, dist).sub(_E).normalize();
    _z.copy(_f).addScaledVector(_u, -_f.dot(_u));
    if (_z.lengthSq() < 1e-6) _z.copy(_n).cross(_u);
    _z.normalize();
    _y.copy(_u).negate();
    _x.crossVectors(_y, _z).normalize();
    _M.makeBasis(_x, _y, _z);
    outQ.setFromRotationMatrix(_M);
    return bend;
  }

  function palmPoint(J, side, out) { return J[(side > 0 ? 'l' : 'r') + 'Wr'].localToWorld(out.set(0, -0.25, 0)); }

  // push a point out of the head sphere and torso capsule
  function pushOut(J, p, margin) {
    const G = MV.chars.G;
    let moved = false;
    J.skull.getWorldPosition(_tmp2);
    const rh = G.headR * 1.08 + margin;
    _tmp.subVectors(p, _tmp2);
    const dh = _tmp.length();
    if (dh < rh) { p.copy(_tmp2).addScaledVector(_tmp.normalize(), rh); moved = true; }
    // torso as a capsule from the hips to the chest
    const a = J.spine.localToWorld(_E.set(0, 0.3, 0)), b = J.spine.localToWorld(_f.set(0, G.torso - 0.4, 0));
    _tmp.subVectors(b, a); const len2 = _tmp.lengthSq();
    const k = U.c01(_tmp2.subVectors(p, a).dot(_tmp) / len2);
    const c = a.addScaledVector(_tmp, k);
    _tmp.subVectors(p, c); const dt = _tmp.length(), rt = 1.12 + margin;
    if (dt < rt) { p.copy(c).addScaledVector(_tmp.normalize(), rt); moved = true; }
    return moved;
  }

  const tgt = { l: V3(), r: V3() }, fk = { l: V3(), r: V3() }, pole = V3(), eyes = V3(), headC = V3();
  // Call after the FK pose is applied and the girl's world matrices are current.
  PH.solveGirl = function (girl, P, S) {
    const J = girl.J, G = MV.chars.G;
    J.skull.getWorldPosition(headC);
    J.head.localToWorld(eyes.set(0, J.hc + 0.05, 1.2));
    for (const side of [1, -1]) {
      const key = side > 0 ? 'l' : 'r', t = tgt[key];
      palmPoint(J, side, fk[key]);
      let w = 0; t.set(0, 0, 0);
      const add = (wt, local, frame) => { if (wt <= 0.001) return; frame.localToWorld(_tmp.set(local[0], local[1], local[2])); t.addScaledVector(_tmp, wt); w += wt; };
      if (side < 0) {
        add(P.ikPhone, [-0.4, G.torso + G.neck + 0.45, 2.5], J.spine);
        add(P.ikSelfie, [-1.25, G.torso + 2.2, 3.3], J.spine);
        add(P.ikEar, [-G.headR - 0.42, J.hc - 0.15, 0.2], J.head);
        add(P.ikLap, [-0.35, 0.75, 2.0], J.spine);
        add(P.ikHeart, [-0.26, J.hc + G.headR + 1.1, 0.55], J.head);
      } else {
        add(P.ikFace, [0.15, J.hc + 0.6, G.headR + 0.3], J.head);
        add(P.ikLap, [0.45, 0.7, 1.95], J.spine);
        add(P.ikHeart, [0.26, J.hc + G.headR + 1.1, 0.55], J.head);
      }
      if (P.ikHug > 0.001 && S && S.dogNeck) {
        _tmp.copy(S.dogNeck).addScaledVector(S.dogSide, side * 0.95 * (S.hugSide || 1));
        t.addScaledVector(_tmp, P.ikHug); w += P.ikHug;
      }
      let weight = U.c01(w);
      if (w > 0) t.multiplyScalar(1 / w);
      else t.copy(fk[key]);
      // never let the hand (or the phone it holds) sink into the head or body
      const margin = side < 0 && P.phone > 0.5 ? 0.75 : 0.32;
      const target = _T.copy(weight > 0 ? t.lerpVectors(fk[key], t, weight) : fk[key]);
      if (pushOut(J, target, margin)) weight = Math.max(weight, 1);
      if (weight < 0.001) continue;
      // elbows hang down, out and slightly back
      J.spine.getWorldQuaternion(_pq);
      pole.set(side * 0.8, -1, -0.5).applyQuaternion(_pq).normalize();
      const bend = solveArm(J, side, target, pole, _qa);
      const sh = J[key + 'Sh'], el = J[key + 'El'];
      // convert to the shoulder's parent space and blend with the FK pose
      sh.parent.getWorldQuaternion(_pq);
      _qb.copy(_pq).invert().multiply(_qa);
      sh.quaternion.slerp(_qb, U.smooth(weight));
      el.rotation.set(U.lerp(el.rotation.x, -bend, U.smooth(weight)), 0, 0);
      sh.updateMatrixWorld(true);
    }
    // turn the phone hand so the screen faces her eyes (or her head, when it is at her ear)
    if (P.aim > 0.001 || P.ikEar > 0.001) {
      const wr = J.rWr, el = J.rEl;
      wr.getWorldPosition(_S);
      const look = P.ikEar > 0.5 ? headC : eyes;
      _x.subVectors(look, _S).normalize();          // palm normal (right hand: local +x)
      J.spine.getWorldQuaternion(_pq);
      _y.copy(UP).applyQuaternion(_pq);
      _y.addScaledVector(_x, -_y.dot(_x)).normalize(); // hand +y points up, so the phone stands upright
      _z.crossVectors(_x, _y);
      _M.makeBasis(_x, _y, _z);
      _qa.setFromRotationMatrix(_M);
      el.getWorldQuaternion(_pq);
      _qb.copy(_pq).invert().multiply(_qa);
      wr.quaternion.slerp(_qb, U.c01(Math.max(P.aim, P.ikEar)));
      wr.updateMatrixWorld(true);
    }
  };

  // ---------------------------------------------------------------- secondary motion
  const GRAV = new THREE.Vector3(0, -140, 0);
  PH.resetGirl = girl => { girl.sim = null; };
  PH.simGirl = function (girl, dt) {
    const J = girl.J, n = J.pony.length, L = 0.62;
    if (!girl.sim || dt <= 0 || dt > 0.25) {
      const nodes = [], prev = [];
      for (let i = 0; i <= n; i++) { const p = J.ponyBase.localToWorld(new THREE.Vector3(0, -L * i, 0.04 * i * i)); nodes.push(p); prev.push(p.clone()); }
      girl.sim = { nodes, prev, skirt: { x: 0, z: 0, vx: 0, vz: 0 }, hipPrev: null, hipVel: new THREE.Vector3(), yawPrev: null, spin: 0 };
      dt = 1 / 60;
    }
    const sim = girl.sim;
    const steps = Math.max(1, Math.min(6, Math.round(dt / (1 / 120)))), h = dt / steps;
    J.skull.getWorldPosition(headC);
    const rHead = MV.chars.G.headR * 1.12 + 0.38;
    for (let s = 0; s < steps; s++) {
      J.ponyBase.getWorldPosition(sim.nodes[0]);
      sim.prev[0].copy(sim.nodes[0]);
      for (let i = 1; i <= n; i++) {
        const x = sim.nodes[i], p = sim.prev[i];
        _tmp.subVectors(x, p).multiplyScalar(0.965);
        p.copy(x);
        x.add(_tmp).addScaledVector(GRAV, h * h);
        // gentle pull toward the styled shape so it keeps its form
        J.ponyBase.localToWorld(_tmp2.set(0, -L * i, 0.04 * i * i));
        x.lerp(_tmp2, 0.02);
      }
      for (let it = 0; it < 4; it++) {
        for (let i = 1; i <= n; i++) {
          const a = sim.nodes[i - 1], b = sim.nodes[i];
          _tmp.subVectors(b, a); const d = _tmp.length() || 1e-6;
          b.copy(a).addScaledVector(_tmp, L / d);
          // collide with the head
          _tmp.subVectors(b, headC); const dh = _tmp.length();
          if (dh < rHead) b.copy(headC).addScaledVector(_tmp.normalize(), rHead);
        }
      }
    }
    // point each segment along the simulated chain
    for (let i = 0; i < n; i++) {
      const seg = J.pony[i], parent = seg.parent;
      parent.updateMatrixWorld(true);
      parent.getWorldQuaternion(_pq);
      _d.subVectors(sim.nodes[i + 1], sim.nodes[i]).normalize().applyQuaternion(_q.copy(_pq).invert());
      seg.quaternion.setFromUnitVectors(DOWN, _d);
      seg.updateMatrixWorld(true);
    }
    // skirt: a damped pendulum pushed by hip acceleration, flaring with spin
    J.hips.getWorldPosition(_S);
    if (sim.hipPrev) {
      const v = _tmp.subVectors(_S, sim.hipPrev).multiplyScalar(1 / Math.max(dt, 1e-3));
      const acc = _tmp2.subVectors(v, sim.hipVel).multiplyScalar(1 / Math.max(dt, 1e-3));
      sim.hipVel.copy(v);
      girl.root.getWorldQuaternion(_pq); acc.applyQuaternion(_q.copy(_pq).invert());
      const sk = sim.skirt, w = 13, z = 0.22;
      for (let s = 0; s < steps; s++) {
        sk.vx += (-w * w * sk.x - 2 * z * w * sk.vx + acc.z * 0.004) * h; sk.x += sk.vx * h;
        sk.vz += (-w * w * sk.z - 2 * z * w * sk.vz - acc.x * 0.004) * h; sk.z += sk.vz * h;
      }
      sk.x = U.clamp(sk.x, -0.35, 0.35); sk.z = U.clamp(sk.z, -0.35, 0.35);
    }
    sim.hipPrev = (sim.hipPrev || V3()).copy(_S);
    const yaw = girl.root.rotation.y;
    if (sim.yawPrev !== null) { const dy = (yaw - sim.yawPrev) / Math.max(dt, 1e-3); sim.spin = U.lerp(sim.spin, Math.abs(dy), 0.2); }
    sim.yawPrev = yaw;
    const flare = 1 + 0.18 * U.c01(sim.spin / 9);
    J.skirt.rotation.set(sim.skirt.x, 0, sim.skirt.z);
    J.skirt.scale.set(flare, 1 - (flare - 1) * 0.5, flare);
  };

  PH.simDog = function (dog, dt) {
    const J = dog.J;
    J.head.getWorldPosition(_S);
    if (!dog.sim || dt <= 0 || dt > 0.25) { dog.sim = { prev: _S.clone(), vel: V3(), ear: 0, earV: 0, tail: 0, tailV: 0 }; return; }
    const sm = dog.sim;
    const v = _tmp.subVectors(_S, sm.prev).multiplyScalar(1 / dt);
    const ay = (v.y - sm.vel.y) / dt;
    sm.vel.copy(v); sm.prev.copy(_S);
    const steps = Math.max(1, Math.round(dt / (1 / 120))), h = dt / steps, w = 11, z = 0.18;
    for (let s = 0; s < steps; s++) {
      sm.earV += (-w * w * sm.ear - 2 * z * w * sm.earV + ay * 0.0035) * h; sm.ear += sm.earV * h;
      sm.tailV += (-w * w * sm.tail - 2 * z * w * sm.tailV - ay * 0.002) * h; sm.tail += sm.tailV * h;
    }
    sm.ear = U.clamp(sm.ear, -0.7, 0.9); sm.tail = U.clamp(sm.tail, -0.6, 0.6);
    J.lEar.rotation.z += sm.ear; J.rEar.rotation.z -= sm.ear;
    J.tail[0].rotation.x += sm.tail;
  };

  // ---------------------------------------------------------------- keep the dog out of her body (XZ plane)
  PH.separate = function (girlPos, girlR, dogRoot, dogFwd, minGap) {
    // dog body as a segment from tail to nose
    const ax = dogRoot.x - dogFwd.x * 1.9, az = dogRoot.z - dogFwd.z * 1.9;
    const bx = dogRoot.x + dogFwd.x * 2.8, bz = dogRoot.z + dogFwd.z * 2.8;
    const ex = bx - ax, ez = bz - az, l2 = ex * ex + ez * ez;
    const k = U.c01(((girlPos.x - ax) * ex + (girlPos.z - az) * ez) / l2);
    const cx = ax + ex * k, cz = az + ez * k;
    let dx = cx - girlPos.x, dz = cz - girlPos.z, d = Math.hypot(dx, dz);
    const need = girlR + 1.15 + (minGap || 0);
    if (d < need) {
      if (d < 1e-4) { dx = -dogFwd.z; dz = dogFwd.x; d = 1; }
      dogRoot.x += dx / d * (need - d); dogRoot.z += dz / d * (need - d);
      return true;
    }
    return false;
  };
})();
