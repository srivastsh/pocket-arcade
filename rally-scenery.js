// All scenery is rendered once into the course bitmap, beneath the racing line.
function drawRallyLandscape(ctx, course, width, height, track) {
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  const color = (day, night) => dark ? night : day;
  const terrain = course.terrain;
  const ground = {
    harbor: boardColors.grass,
    alpine: color('#d9e5e8', '#526772'),
    desert: color('#e7bd86', '#967354'),
    forest: color('#83ac84', '#456655')
  };
  ctx.save();
  ctx.fillStyle = ground[terrain] || boardColors.grass;
  ctx.fillRect(0, 0, width, height);
  ctx.lineCap = ctx.lineJoin = 'round';

  function polygon(points, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (const point of points.slice(1)) ctx.lineTo(...point);
    ctx.closePath();
    ctx.fill();
  }
  function ellipse(x, y, rx, ry, rotation, fill) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }
  function offRoad(x, y, radius) {
    const minDistance = (course.roadRadius + 9 + radius) ** 2;
    return track.every(([px, py]) => (px - x) ** 2 + (py - y) ** 2 >= minDistance);
  }
  // A deterministic scatter keeps the landmarks fixed on every lap and resize.
  let state = 47117;
  function random() {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  }
  function scatter(count, radius, draw) {
    for (let i = 0; i < count; i++) {
      const x = random() * width, y = random() * height, size = .75 + random() * .5;
      if (offRoad(x, y, radius * size)) draw(x, y, size);
    }
  }
  function contours(x, y, rx, ry, tilt, spacing, stroke) {
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = stroke;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(x, y, rx + spacing * i, ry + spacing * i * .6, tilt, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (terrain === 'harbor') {
    contours(553, 249, 95, 60, -.28, 16, 'rgba(45,91,68,.17)');
    contours(73, 79, 42, 22, -.53, 14, 'rgba(45,91,68,.17)');
    ctx.beginPath();
    ctx.moveTo(width, 0); ctx.lineTo(width, 235);
    ctx.bezierCurveTo(730, 187, 760, 137, 676, 99);
    ctx.bezierCurveTo(617, 71, 620, 17, 558, 0);
    ctx.closePath();
    ctx.fillStyle = boardColors.water; ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = color('rgba(234,250,255,.45)', 'rgba(171,212,225,.28)');
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 40; i++) {
      const x = 568 + random() * 212, y = random() * 225;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x+4, y+2, x+10, y); ctx.stroke();
    }
    ctx.restore();
    // Parallel slips give the inlet a recognizable marina at racing scale.
    ctx.save(); ctx.translate(736, 161); ctx.rotate(-.48);
    ctx.fillStyle = color('#9b8063', '#645d56');
    ctx.fillRect(-5, -57, 5, 65);
    for (let i = 0; i < 4; i++) ctx.fillRect(0, -56 + i*14, 22, 3);
    ctx.restore();
    for (const [cx, cy] of [[100,82],[395,239],[532,279],[724,379],[78,406],[262,42]]) {
      for (let i = 0; i < 10; i++) {
        const angle = i * 2.4, radius = Math.sqrt(i)*7;
        const x = cx + Math.cos(angle)*radius, y = cy + Math.sin(angle)*radius;
        if (!offRoad(x, y, 7)) continue;
        ellipse(x, y, 5+i%4, 5+i%4, 0, 'rgba(36,93,66,.44)');
        ellipse(x-1.5, y-2, 3+i%3, 3+i%3, 0, 'rgba(159,195,138,.55)');
      }
    }
  } else if (terrain === 'alpine') {
    contours(82, 70, 60, 24, -.43, 15, color('#bfced4', '#617783'));
    contours(591, 359, 82, 38, -.64, 17, color('#bfced4', '#617783'));
    scatter(36, 25, (x, y, size) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-.2 + .35 * random()); ctx.scale(size,size);
      // Top-down ridge in sun and shade, with its steepest face on the southeast.
      polygon([[-22,7],[-11,-7],[0,-13],[20,-3],[25,7],[12,13],[-7,12]], color('#a9bcc5','#435864'));
      polygon([[-22,7],[-11,-7],[0,-13],[10,-3],[-2,0],[-8,7]], color('#eef4f4','#a4b9c1'));
      polygon([[0,-13],[20,-3],[25,7],[10,-1],[-2,0]], color('#cedee3','#819aa6'));
      ctx.restore();
    });
    scatter(125, 3, (x,y,size) => {
      ellipse(x, y, 2.1 * size, 1.05 * size, -.44, color('#9fb4bf','#8197a0'));
    });
  } else if (terrain === 'desert') {
    ctx.strokeStyle = color('rgba(169,106,64,.24)','rgba(239,193,142,.18)');
    ctx.lineWidth = 1.35;
    for (let i = 0; i < 14; i++) {
      const y = i * 42 - 65;
      ctx.beginPath(); ctx.moveTo(-35, y);
      ctx.bezierCurveTo(152,y-58,263,y+54,419,y+17);
      ctx.bezierCurveTo(546,y-15,640,y-38,815,y-12); ctx.stroke();
    }
    scatter(19, 29, (x,y,size) => {
      ctx.save(); ctx.translate(x,y); ctx.scale(size,size); ctx.rotate(-.28);
      polygon([[-26,9],[-23,-5],[-7,-13],[12,-12],[25,-4],[26,8],[8,15],[-12,15]],color('#bc8356','#73533f'));
      polygon([[-25,4],[-20,-8],[-6,-15],[15,-12],[24,-5],[19,4],[2,9],[-15,10]],color('#d99c66','#a87853'));
      polygon([[-17,1],[-14,-6],[-4,-10],[12,-9],[17,-5],[7,0],[-7,4]],color('#efbb7f','#bf986b'));
      ctx.restore();
    });
    scatter(48, 9, (x,y,size) => {
      ctx.save(); ctx.translate(x,y); ctx.scale(size,size);
      ellipse(4, 6, 6, 1.6, .21, 'rgba(91,69,44,.22)');
      ctx.lineWidth = 2.7; ctx.strokeStyle=color('#647e5c','#466352');
      ctx.beginPath(); ctx.moveTo(0,5); ctx.lineTo(0,-6); ctx.moveTo(0,1);
      ctx.quadraticCurveTo(-4,1,-4,-3); ctx.moveTo(0,-1); ctx.quadraticCurveTo(4,-1,4,-5); ctx.stroke();
      ctx.restore();
    });
  } else if (terrain === 'forest') {
    contours(360, 230, 75, 35, -.41, 20, color('rgba(44,87,61,.18)','rgba(144,178,146,.13)'));
    let pond;
    // Place the pond in an open clearing away from the asphalt.
    for (const [x,y] of [[350,240],[465,251],[230,230],[574,208],[95,50],[720,408]]) {
      if (!offRoad(x, y, 44)) continue;
      pond = [x, y];
      ellipse(x, y, 43, 23, -.33, color('#779b74','#516e59'));
      ellipse(x, y, 39, 19, -.33, boardColors.water);
      ellipse(x+9, y+1, 22, 9, -.33, color('rgba(54,108,130,.19)','rgba(29,52,72,.25)'));
      break;
    }
    const canopies = dark ? ['#344e42','#3a5c49','#4b6a52'] : ['#4e795c','#598662','#67946b'];
    scatter(430, 8, (x,y,size) => {
      // Keep clearings amongst the woods, with denser stands along the course edge.
      if (pond && Math.hypot(x-pond[0],y-pond[1]) < 49) return;
      if (Math.sin(x/61) * Math.sin(y/47) > .42) return;
      ctx.save(); ctx.translate(x,y); ctx.scale(size,size);
      ellipse(2.5,4,6,3,.36,'rgba(25,53,40,.20)');
      polygon([[-6,3],[-3,-1],[-4,-1],[0,-8],[4,-1],[3,-1],[6,3],[1,5]],canopies[Math.floor(random()*3)]);
      polygon([[-6,3],[0,-8],[0,4]],color('rgba(180,205,155,.36)','rgba(166,195,158,.21)'));
      ctx.restore();
    });
  }
  ctx.restore();
}
