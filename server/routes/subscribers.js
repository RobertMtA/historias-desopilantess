const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

// GET /api/subscribers - Obtener todos los suscriptores (para admin)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const subscribers = await Subscriber.find(filter)
      .sort({ subscribedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Subscriber.countDocuments(filter);
    
    res.json({
      subscribers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error obteniendo suscriptores:', error);
    res.status(500).json({ error: 'Error al obtener suscriptores' });
  }
});

// POST /api/subscribers - Crear nuevo suscriptor
router.post('/', async (req, res) => {
  try {
    const { email, name, source = 'home' } = req.body;
    
    // Validación básica
    if (!email) {
      return res.status(400).json({ error: 'El email es obligatorio' });
    }
    
    // Verificar si ya existe
    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(409).json({ 
          error: 'Este email ya está suscrito',
          message: 'Ya estás recibiendo nuestras historias desopilantes!' 
        });
      } else {
        // Reactivar suscripción
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        existingSubscriber.unsubscribedAt = null;
        existingSubscriber.source = source;
        if (name) existingSubscriber.name = name;
        
        await existingSubscriber.save();
        
        return res.status(200).json({
          message: '¡Suscripción reactivada con éxito!',
          subscriber: {
            id: existingSubscriber._id,
            email: existingSubscriber.email,
            name: existingSubscriber.name
          }
        });
      }
    }
    
    // Crear nuevo suscriptor
    const subscriber = new Subscriber({
      email: email.toLowerCase(),
      name: name || '',
      source
    });
    
    await subscriber.save();
    
    res.status(201).json({
      message: '¡Suscripción exitosa! Pronto recibirás nuestras mejores historias.',
      subscriber: {
        id: subscriber._id,
        email: subscriber.email,
        name: subscriber.name
      }
    });
    
  } catch (error) {
    console.error('Error creando suscriptor:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Este email ya está suscrito' });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Error al procesar la suscripción' });
  }
});

// DELETE /api/subscribers/unsubscribe/:token - Desuscribir por token
router.delete('/unsubscribe/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const subscriber = await Subscriber.findOne({ unsubscribeToken: token });
    
    if (!subscriber) {
      return res.status(404).json({ error: 'Token de desuscripción inválido' });
    }
    
    await subscriber.unsubscribe();
    
    res.json({ message: 'Te has desuscrito exitosamente' });
    
  } catch (error) {
    console.error('Error desuscribiendo:', error);
    res.status(500).json({ error: 'Error al procesar la desuscripción' });
  }
});

// POST /api/subscribers/unsubscribe - Desuscribir por email
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'El email es obligatorio' });
    }
    
    const subscriber = await Subscriber.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });
    
    if (!subscriber) {
      return res.status(404).json({ error: 'Email no encontrado o ya desuscrito' });
    }
    
    await subscriber.unsubscribe();
    
    res.json({ message: 'Te has desuscrito exitosamente' });
    
  } catch (error) {
    console.error('Error desuscribiendo:', error);
    res.status(500).json({ error: 'Error al procesar la desuscripción' });
  }
});

// GET /api/subscribers/stats - Estadísticas de suscriptores
router.get('/stats', async (req, res) => {
  try {
    const totalActive = await Subscriber.countDocuments({ isActive: true });
    const totalInactive = await Subscriber.countDocuments({ isActive: false });
    const totalToday = await Subscriber.countDocuments({
      subscribedAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      },
      isActive: true
    });
    
    // Suscriptores por fuente
    const bySource = await Subscriber.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalActive,
      totalInactive,
      totalToday,
      bySource: bySource.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
