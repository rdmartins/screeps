/**
 * Find a new source with clean path.
 * @param  {Creep} creep - The creep to find the source for.
 * @param  {SearchCriteria} criteria
 * Criteria to search the new target.
 *
 * `ClosestByPath`: Find an object with the shortest path from the given position.
 * `ClosestByRange`: Find an object with the shortest linear distance from the given position.
 */
export function findSource(creep: Creep, criteria: SearchCriteria): void {
  let source: Source | null;

  switch (criteria) {
    case SearchCriteria.ClosestByPath:
      source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      break;
    case SearchCriteria.ClosestByRange:
      source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
      break;
    default:
      [source] = creep.room.find(FIND_SOURCES_ACTIVE);
  }

  if (source) {
    creep.memory.target = source.id;
  } else { // No source
    delete creep.memory.target;
  }
}

/**
 * Spawn a new creep.
 * @param  {CreepRole} role - The role of the new creep.
 * @param  {BodyPartConstant[]} [body=[]] - The starter body. Does not multiply.
 * @param  {BodyPartConstant[]} model - The body model to multiply.
 * @param  {number} multiplier - The multiplication factor.
 * @param  {StructureSpawn} spawn - The Spawn to spawn the creep.
 */
export function spawnCreep(
  role: CreepRole,
  body: BodyPartConstant[] = [],
  model: BodyPartConstant[],
  multiplier: number,
  spawn: StructureSpawn
): void {
  for (let i = 0; i < multiplier; i += 1) {
    body.push(...model);
  }

  const memory = { role: role };

  const name = `${role}-x${multiplier}-${Game.time}`;

  spawn.spawnCreep(body, name, { memory });
}
