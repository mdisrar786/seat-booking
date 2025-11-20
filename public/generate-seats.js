// Run this in browser console to generate 15,000 seats
function generateSeats() {
  const sections = [
    { id: 'LB-A', rows: 50, seatsPerRow: 100, startX: 100, startY: 100 },
    { id: 'LB-B', rows: 50, seatsPerRow: 100, startX: 600, startY: 100 },
    { id: 'LB-C', rows: 50, seatsPerRow: 100, startX: 1100, startY: 100 },
    { id: 'UB-A', rows: 40, seatsPerRow: 80, startX: 100, startY: 600 },
    { id: 'UB-B', rows: 40, seatsPerRow: 80, startX: 600, startY: 600 },
    { id: 'VIP', rows: 10, seatsPerRow: 50, startX: 1100, startY: 600 }
  ];

  const venueData = {
    venueId: "arena-01",
    name: "Metropolis Mega Arena", 
    map: { width: 2000, height: 1500 },
    sections: []
  };

  sections.forEach(sectionConfig => {
    const section = {
      id: sectionConfig.id,
      label: sectionConfig.id.includes('LB') ? `Lower Bowl ${sectionConfig.id.slice(-1)}` : 
             sectionConfig.id.includes('UB') ? `Upper Bowl ${sectionConfig.id.slice(-1)}` : 'VIP Section',
      transform: { x: sectionConfig.startX, y: sectionConfig.startY, scale: 1 },
      rows: []
    };

    for (let row = 1; row <= sectionConfig.rows; row++) {
      const rowData = {
        index: row,
        seats: []
      };

      for (let seatNum = 1; seatNum <= sectionConfig.seatsPerRow; seatNum++) {
        // Randomize status - 80% available, 10% reserved, 10% unavailable
        const random = Math.random();
        let status = 'available';
        if (random > 0.9) status = 'reserved';
        else if (random > 0.8) status = 'unavailable';

        // Price tiers based on section
        let priceTier = 3; // default
        if (sectionConfig.id === 'VIP') priceTier = 1;
        else if (sectionConfig.id.includes('LB')) priceTier = 2;
        else if (sectionConfig.id.includes('UB')) priceTier = 4;

        const seat = {
          id: `${sectionConfig.id}-${row}-${seatNum.toString().padStart(3, '0')}`,
          col: seatNum,
          x: sectionConfig.startX + (seatNum * 15),
          y: sectionConfig.startY + (row * 20),
          priceTier: priceTier,
          status: status
        };

        rowData.seats.push(seat);
      }

      section.rows.push(rowData);
    }

    venueData.sections.push(section);
  });

  console.log('Total seats:', venueData.sections.reduce((total, section) => 
    total + section.rows.reduce((sectionTotal, row) => 
      sectionTotal + row.seats.length, 0), 0));
  
  return venueData;
}

// Copy this output to your venue.json
console.log(JSON.stringify(generateSeats(), null, 2));