module.exports = [
  {
    path: '/pets',
    method: 'GET',
  },
  {
    path: '/pets?name=abc',
    method: 'GET',
  },
  {
    path: '/pets/findByStatus',
    method: 'GET',
  },
  {
    dynamic: true,
    path: '/pets/findByStatus?status=pending',
    method: 'GET',
  },
  {
    dynamic: true,
    path: '/pets/123',
    method: 'GET',
  },
  {
    path: '/pets/123',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: "name=just_a_name"
  },
  {
    path: '/pets/123',
    method: 'PATCH',
    body: {
      name: 'a_new_name'
    }
  },
  {
    path: '/pets/123?__code=404',
    method: 'GET',
  },
  {
    dynamic: true,
    path: '/pets/123?__code=418',
    method: 'GET',
  },
  {
    path: '/pets/findByTags',
    method: 'GET',
  },
  {
    dynamic: true,
    path: '/pets/findByStatus?status=available&status=sold',
    method: 'GET',
  },
  {
    dynamic: true,
    path: '/user/username',
    method: 'GET',
  },
  {
    dynamic: true,
    path: '/store/order',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      body: {
        id: 1,
        petId: 2,
        quantity: 3,
        shipDate: '2002-10-02T10:00:00-05:00',
        status: 'placed',
        complete: true,
      }
    }
  },
  {
    path: '/pets',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      id: 1,
      petId: 2,
      quantity: 3,
      shipDate: '2002-10-02T10:00:00-05:00',
      status: 'placed',
      complete: true,
    }
  },
  {
    dynamic: true,
    path: '/pets/123?__code=499',
    method: 'GET',
  },
  {
    path: '/pets/findByStatus?status=available&__code=499',
    method: 'GET',
  }
];