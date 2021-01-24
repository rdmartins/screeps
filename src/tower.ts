export function AttackAndRepair(room: Room): void {
  const towers = room.find(FIND_MY_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_TOWER,
  }) as StructureTower[];

  Object.values(towers).forEach((tower) => {
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    if (closestHostile) {
      tower.attack(closestHostile);
    } else { // No hostiles
      const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax,
      });

      if (closestDamagedStructure) {
        tower.repair(closestDamagedStructure);
      }
    }
  });
}
