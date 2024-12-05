import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import validator from 'validator';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(
  cors({
    // origin: 'http://localhost:3000',
    origin: 'https://node-express-typescript-notes-project-1.onrender.com',
  })
);

// Define a custom request type to include user information
interface CustomRequest extends Request {
  user?: { email: string };
}



// Middleware to extract and validate user email from headers
app.use((req: CustomRequest, res: Response, next: NextFunction) => {
  const email = req.header('x-user-email');
  if (!email || !validator.isEmail(email)) {
    res.status(401).send('Unauthorized: Invalid or missing email');
    return;
  }
  req.user = { email };
  next();
});

// Fetch notes for the authenticated user
app.get('/api/notes', async (req: CustomRequest, res: Response) => {
  const email = req.user?.email;
  if (!email) {
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    const notes = await prisma.note.findMany({
      where: { userEmail: email },
    });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Create a new note for the authenticated user
app.post('/api/notes', async (req: CustomRequest, res: Response) => {
  const email = req.user?.email;
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400).send('Title and content are required');
    return;
  }

try {
  if (!email) {
    throw new Error('User email is required');
  }

  const newNote = await prisma.note.create({
    data: { title, content, userEmail: email },
  });
  res.status(201).json(newNote);
} catch (error) {
  console.error(error);
  res.status(500).send('Internal Server Error');
}})

// Update a note for the authenticated user
app.put('/api/notes/:id', async (req: CustomRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const email = req.user?.email;
  const { title, content } = req.body;

  if (isNaN(id)) {
    res.status(400).send('ID must be a valid number');
    return;
  }
  if (!title || !content) {
    res.status(400).send('Title and content are required');
    return;
  }

  try {
    const updatedNote = await prisma.note.updateMany({
      where: { id, userEmail: email },
      data: { title, content },
    });

    if (updatedNote.count === 0) {
      res.status(404).send('Note not found');
    } else {
      res.json({ id, title, content });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete a note for the authenticated user
app.delete('/api/notes/:id', async (req: CustomRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const email = req.user?.email;

  if (isNaN(id)) {
    res.status(400).send('ID must be a valid number');
    return;
  }

  try {
    const deletedNote = await prisma.note.deleteMany({
      where: { id, userEmail: email },
    });

    if (deletedNote.count === 0) {
      res.status(404).send('Note not found');
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
