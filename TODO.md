## User

- [x] router.get('/list', getUserProfilesList)
- [x] router.get('/me', getCurrentUser);
- [ ] router.post('/me/change-password', changeUserPassword);
- [ ] router.get('/join-pet', joinPetById);
- [x] router.post('/', validate(createUserSchema), addUser);
- [x] router.put('/:id', validate(updateUserSchema), updateUserInfo);
- [x] router.get('/:id', getUserById);
- [ ] router.post('/:id/assign-pets', assignPetsToUser);
- [ ] router.post('/:id/add-pets', addPetsToUser);
- [ ] router.post('/:id/remove-pets', removePetsFromUser);
- [ ] router.get('/:id/pets/list', getPetsByUserId);
- [x] router.delete('/:id', deleteUserProfileById);

## Pet

- [ ] router.get('/', getAllPets);
- [ ] router.get('/list', getPetsList);
- [ ] router.post('/', validate(createPetSchema), createNewPet);
- [ ] router.put('/:id', validate(updatePetSchema), updatePetInfo);
- [ ] router.get('/:id', getPetById);
- [ ] router.get('/:id/users/list', getUsersByPetId);
- [ ] router.delete('/:id', deletePetById);

## Pet Invite

- [ ] router.post('/pets/:petId/invites', createPetInviteLink);
- [ ] router.get('/:token', getPetInvite);
- [ ] router.get('/:token/accept', invitePetToUser);

## Pet Type

- [ ] router.post('/', validate(createPetTypeSchema), addPetType);
- [ ] router.put('/:id', validate(updatePetTypeSchema), modifyPetType);
- [ ] router.get('/', getAllPetTypes);
- [ ] router.get('/:id', getPetTypeById);
- [ ] router.delete('/:id', deletePetTypeById);

## Gender

- [ ] router.get('/', getGenders);
