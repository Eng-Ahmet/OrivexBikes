import { Request, Response } from 'express';

export const getTariffs = (req: Request, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : 1;

  const malagaMatrix = [
    { vehicle: 'Bikes', icon: 'fa-solid fa-bicycle text-primary', deposit: '30 €', min20: '—', min30: '—', h1: '5 €', h2: '—', h5: '15 €', d1: '20 €', d3_plus: '15 €/día', w1_plus: '10 €/día', w2_plus: '8 €/día' },
    { vehicle: 'E-Bikes (VISA)', icon: 'fa-solid fa-bolt text-warning', deposit: '100 €', min20: '—', min30: '—', h1: '15 €', h2: '20 €', h5: '25 €', d1: '40 €', d3_plus: '30 €/día', w1_plus: '25 €/día', w2_plus: '20 €/día' },
    { vehicle: 'Scooters', icon: 'fa-solid fa-bolt-lightning text-success', deposit: '50 €', min20: '—', min30: '10 €', h1: '15 €', h2: '20 €', h5: '—', d1: '40 €', d3_plus: '30 €/día', w1_plus: '25 €/día', w2_plus: '20 €/día' },
    { vehicle: 'XL Cars', icon: 'fa-solid fa-truck text-danger', deposit: '20 €', min20: '15 €', min30: '20 €', h1: '30 €', h2: '—', h5: '—', d1: '—', d3_plus: '—', w1_plus: '—', w2_plus: '—' },
    { vehicle: 'S cars/Quads', icon: 'fa-solid fa-car text-info', deposit: '20 €', min20: '10 €', min30: '15 €', h1: '25 €', h2: '—', h5: '—', d1: '—', d3_plus: '—', w1_plus: '—', w2_plus: '—' },
    { vehicle: 'Buggy\'s', icon: 'fa-solid fa-motorcycle text-warning', deposit: '20 €', min20: '—', min30: '5 €', h1: '—', h2: '—', h5: '—', d1: '—', d3_plus: '—', w1_plus: '—', w2_plus: '—' }
  ];

  const mijasMatrix = [
    { vehicle: 'E-Bike Trekking', icon: 'fa-solid fa-bolt text-warning', deposit: '100 €', min20: '—', min30: '—', h1: '15 €', h2: '25 €', h5: '30 €', d1: '40 €', d3_plus: '30 €/día', w1_plus: '25 €/día', w2_plus: '20 €/día' },
    { vehicle: 'MTB Mountain Bikes', icon: 'fa-solid fa-bicycle text-primary', deposit: '50 €', min20: '—', min30: '—', h1: '7 €', h2: '—', h5: '15 €', d1: '25 €', d3_plus: '20 €/día', w1_plus: '15 €/día', w2_plus: '12 €/día' },
    { vehicle: 'Offroad E-Scooters', icon: 'fa-solid fa-bolt-lightning text-success', deposit: '50 €', min20: '—', min30: '12 €', h1: '18 €', h2: '25 €', h5: '—', d1: '45 €', d3_plus: '35 €/día', w1_plus: '28 €/día', w2_plus: '22 €/día' }
  ];

  return res.json({
    store_id: storeId,
    matrix: storeId === 2 ? mijasMatrix : malagaMatrix
  });
};
