export function W8N3() {
  const sourceLink = Game.getObjectById('6000b7c9a3371d45fe1426f4') as StructureLink;
  const controllerLink = Game.getObjectById('6000bc1a04790945efed35f6') as StructureLink;

  sourceLink.transferEnergy(
    controllerLink,
    controllerLink.store.getFreeCapacity(RESOURCE_ENERGY),
  );
}
