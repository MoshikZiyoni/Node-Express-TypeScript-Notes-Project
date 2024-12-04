import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
app.use(express.json());
app.use(cors({
    origin: 'https://node-express-typescript-notes-project-1.onrender.com'
  }));
app.get("/api/notes", async (req, res) => {
    const notes = await prisma.note.findMany();
    res.json(notes);
});

app.post("/api/notes", async (req, res) => {
    const { title, content } = req.body;
    console.log(title,content,'@@@@');
    
    if (!title || !content) {
        res.status(400).send('Title and content are required');
        return;
    }

    try {
        const newNote = await prisma.note.create({
            data: { title, content }
        });
        res.json(newNote);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.put("/api/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, content } = req.body;
    if (!id || isNaN(id)) {
        res.status(400).send('ID must be valid number');
        return;
    }
    if (!title || !content) {
        res.status(400).send('Title and content are required');
        return;
    }
    try {
        const updatedNote = await prisma.note.update({
            where: { id: id },
            data: { title, content }
        });
        res.json(updatedNote);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.delete("/api/notes/:id", async (req, res ) => {
    const id = parseInt(req.params.id);
    if (!id || isNaN(id)) {
        res.status(400).send('ID must be valid number');
        return;
    }
    try {
        await prisma.note.delete({
            where: { id: id }
        });
        console.log('DELETED Note with ID: ', id);
        
        res.status(204).send('Delete')
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}) 

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});