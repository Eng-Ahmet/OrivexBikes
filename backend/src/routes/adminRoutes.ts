import { Router, Request, Response } from 'express';
import { memoryData, CustomerReview, SupportTicket, FaqItem } from '../db/initSchema.js';

const router = Router();

// 1. GET /api/v1/admin/reviews - Get all reviews for moderation
router.get('/reviews', (req: Request, res: Response) => {
  const reviews = memoryData.customer_reviews || [];
  return res.json(reviews);
});

// 2. PATCH /api/v1/admin/reviews/:id/approve - Approve review
router.patch('/reviews/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const review = (memoryData.customer_reviews || []).find(r => r.id === Number(id));
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  review.status = 'APPROVED';
  review.approved_by = 1;
  review.approved_at = new Date().toISOString();

  return res.json({ message: 'Review approved successfully', review });
});

// 3. PATCH /api/v1/admin/reviews/:id/reject - Reject review
router.patch('/reviews/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const review = (memoryData.customer_reviews || []).find(r => r.id === Number(id));
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  review.status = 'REJECTED';
  review.rejected_by = 1;
  review.rejected_at = new Date().toISOString();

  return res.json({ message: 'Review rejected', review });
});

// 4. GET /api/v1/admin/support - Get support tickets
router.get('/support', (req: Request, res: Response) => {
  const tickets = memoryData.support_tickets || [];
  return res.json(tickets);
});

// 5. PATCH /api/v1/admin/support/:id/status - Update support ticket status
router.patch('/support/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const ticket = (memoryData.support_tickets || []).find(t => t.id === Number(id) || t.ticket_code === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Support ticket not found' });
  }

  ticket.status = status || 'IN_PROGRESS';
  return res.json({ message: 'Ticket status updated', ticket });
});

// 6. GET /api/v1/admin/tour-bookings - Get tour reservations
router.get('/tour-bookings', (req: Request, res: Response) => {
  const tourBookings = memoryData.tour_bookings || [];
  return res.json(tourBookings);
});

// 7. GET /api/v1/admin/faqs & POST /api/v1/admin/faqs
router.get('/faqs', (req: Request, res: Response) => {
  return res.json(memoryData.faqs || []);
});

router.post('/faqs', (req: Request, res: Response) => {
  const { question, answer, category } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  const newFaq: FaqItem = {
    id: Date.now(),
    question,
    answer,
    category: category || 'General',
    order_num: (memoryData.faqs || []).length + 1,
    is_active: true
  };

  memoryData.faqs = memoryData.faqs || [];
  memoryData.faqs.push(newFaq);

  return res.status(201).json(newFaq);
});

export default router;
