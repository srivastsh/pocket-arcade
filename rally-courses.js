// Node zero is the finish line. Gates follow the driving direction around each loop.
const rallyCourses = [
  {
    id: 'harbor', name: 'Harbor Circuit', terrain: 'harbor', roadRadius: 29,
    description: 'Sweep along the waterfront and turn inland for the tighter middle section.',
    nodes: [
      [290,378],[480,378],[620,350],[686,273],[643,199],[530,192],[463,119],
      [362,79],[249,108],[222,182],[123,210],[90,307],[158,372]
    ],
    gateNodes: [2,4,7,9,11]
  },
  {
    id: 'alpine', name: 'Alpine Switchbacks', terrain: 'alpine', roadRadius: 24,
    description: 'Brake before the two hairpins, then accelerate down the long return leg.',
    nodes: [
      [305,400],[185,398],[90,350],[74,282],[113,206],[184,126],[291,65],
      [365,71],[371,122],[283,176],[221,228],[231,273],[283,290],[377,242],
      [471,169],[562,104],[633,92],[694,129],[710,209],[651,283],[543,344],[420,386]
    ],
    gateNodes: [2,5,8,11,15,18,20]
  },
  {
    id: 'desert', name: 'Red Mesa Speedway', terrain: 'desert', roadRadius: 34,
    description: 'Carry speed down the back straight and through the wide desert sweeper.',
    nodes: [
      [310,371],[174,371],[93,338],[65,258],[86,165],[143,103],[233,83],
      [359,83],[497,83],[623,86],[698,134],[710,204],[663,256],
      [583,281],[528,331],[455,369]
    ],
    gateNodes: [2,5,9,12,14]
  },
  {
    id: 'forest', name: 'Redwood Run', terrain: 'forest', roadRadius: 26,
    description: 'Link the S-bends through the redwoods and set up early for the next turn.',
    nodes: [
      [150,342],[183,385],[252,383],[302,328],[362,320],[433,374],[526,388],
      [612,343],[690,304],[708,234],[664,165],[588,135],[517,73],
      [438,70],[370,132],[315,154],[238,105],[160,94],[95,143],[73,223],[110,285]
    ],
    gateNodes: [2,4,7,10,13,16,19]
  }
];
