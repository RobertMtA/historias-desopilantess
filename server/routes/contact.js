const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendContactEmail, sendConfirmationEmail } = require('../config/emailConfig');

// GET /api/contact - Obtener todos los mensajes de contacto (para admin)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, tipoConsulta } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (tipoConsulta) filter.tipoConsulta = tipoConsulta;
    
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Contact.countDocuments(filter);
    
    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error obteniendo mensajes de contacto:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// POST /api/contact - Crear nuevo mensaje de contacto
router.post('/', async (req, res) => {
  try {
    console.log('📨 Recibiendo mensaje de contacto:', req.body);
    const { nombre, email, asunto, mensaje, tipoConsulta } = req.body;
    
    // Validación básica
    if (!nombre || !email || !asunto || !mensaje) {
      console.log('❌ Validación fallida - campos faltantes');
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios',
        fields: { nombre, email, asunto, mensaje }
      });
    }
    
    console.log('✅ Validación básica pasada, creando contacto...');
    
    // Crear nuevo mensaje de contacto
    const contact = new Contact({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      asunto: asunto.trim(),
      mensaje: mensaje.trim(),
      tipoConsulta: tipoConsulta || 'general'
    });
    
    console.log('💾 Guardando en MongoDB...');
    await contact.save();
    console.log('✅ Contacto guardado exitosamente:', contact._id);
    
    // Enviar emails de notificación
    try {
      // Email al administrador
      const adminEmailResult = await sendContactEmail({
        nombre: contact.nombre,
        email: contact.email,
        asunto: contact.asunto,
        mensaje: contact.mensaje,
        tipoConsulta: contact.tipoConsulta
      });
      
      // Email de confirmación al usuario
      const confirmationEmailResult = await sendConfirmationEmail({
        nombre: contact.nombre,
        email: contact.email,
        asunto: contact.asunto
      });
      
      console.log('Resultados de email:', {
        admin: adminEmailResult,
        confirmation: confirmationEmailResult
      });
      
    } catch (emailError) {
      console.error('Error enviando emails:', emailError);
      // No retornamos error para que el mensaje se guarde aunque falle el email
    }
    
    res.status(201).json({
      message: 'Mensaje enviado exitosamente. Te responderemos pronto.',
      contact: {
        id: contact._id,
        nombre: contact.nombre,
        email: contact.email,
        asunto: contact.asunto,
        tipoConsulta: contact.tipoConsulta,
        createdAt: contact.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error creando mensaje de contacto:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

// PUT /api/contact/:id/status - Actualizar estado del mensaje
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['nuevo', 'leido', 'respondido', 'cerrado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Estado inválido', 
        validStatuses 
      });
    }
    
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }
    
    contact.status = status;
    if (notes) contact.notes = notes;
    if (status === 'respondido' && !contact.respondedAt) {
      contact.respondedAt = new Date();
    }
    
    await contact.save();
    
    res.json({
      message: 'Estado actualizado exitosamente',
      contact
    });
    
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// GET /api/contact/stats - Estadísticas de mensajes de contacto
router.get('/stats', async (req, res) => {
  try {
    const totalMessages = await Contact.countDocuments();
    const newMessages = await Contact.countDocuments({ status: 'nuevo' });
    const respondedMessages = await Contact.countDocuments({ status: 'respondido' });
    
    // Mensajes por tipo de consulta
    const byType = await Contact.aggregate([
      { $group: { _id: '$tipoConsulta', count: { $sum: 1 } } }
    ]);
    
    // Mensajes por estado
    const byStatus = await Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Mensajes de hoy
    const today = await Contact.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });
    
    res.json({
      totalMessages,
      newMessages,
      respondedMessages,
      today,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byStatus: byStatus.reduce((acc, item) => {
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
