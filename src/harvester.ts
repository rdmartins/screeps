export function harvest(creep: Creep): void {
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

    if (creep.harvest(source) < 0) {
        creep.moveTo(source.pos);
    }

    if (creep.store[RESOURCE_ENERGY] >= creep.store.getCapacity()) {
        creep.memory.mode = CreepMode.Working;
    }
}