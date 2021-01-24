/**
 * Construct an extractor.
 * @param  {number} multiplier - Multiply body size.
 * @param  {StructureSpawn} spawn - Where to spawn the new creep.
 */
export function construct(multiplier: number, spawn: StructureSpawn): void {
  const body: BodyPartConstant[] = [MOVE];
  const model: BodyPartConstant[] = [WORK];

  for (let i = 0; i < multiplier; i += 1) {
    body.push(...model);
  }

  const memory: CreepMemory = {
    role: CreepRole.Extractor
  };

  const name = `extractor-x${multiplier}-${Game.time}`;

  spawn.spawnCreep(body, name, { memory });
}

/**
 * Find a new container with clean path
 * @param  {Creep} creep - The creep to find the container for
 */
function findNewContainer(creep: Creep) {
  const containers = creep.room.find(FIND_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_CONTAINER
  }) as StructureContainer[];

  Object.values(containers).forEach((container) => {
    let isFree = true;
    const creeps = creep.room.find(FIND_MY_CREEPS);

    Object.values(creeps).every((c) => {
      isFree = !container.pos.isEqualTo(c);
      return isFree;
    });

    if (isFree) {
      creep.memory.container = container.id;
      return false;
    }

    return true;
  });
}

/**
 * Find the most close source
 * @param  {Creep} creep - The creep to find the source for
 */
function findSource(creep: Creep) {
  creep.memory.source = (creep.pos.findClosestByRange(FIND_SOURCES) as Source).id;
}

export function run(creep: Creep): void {
  if (creep.memory.container) {
    const container = Game.getObjectById(creep.memory.container);

    if (container) {
      if (!creep.pos.isEqualTo(container.pos)) {
        creep.moveTo(container);
      } else { // creep.pos == container.pos
        if (creep.memory.source) {
          const source = Game.getObjectById(creep.memory.source);

          if (source) {
            creep.harvest(source);
          } else { // No source
            findSource(creep);
          }
        } else { // No creep.memory.source
          findSource(creep);
        }
      }
    } else { // No container
      findNewContainer(creep);
    }
  } else { // No creep.memory.container
    findNewContainer(creep);
  }
}
