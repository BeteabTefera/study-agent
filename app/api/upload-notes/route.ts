//Backend extracts text from uploaded notes -> returns text to front end OR stores on server temp
import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import mime from 'mime-types';
import { extractTextFromPDF, extractTextFromDocx } from '../../../lib/extractText';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // temp file path
        const tempPath = `/tmp/${file.name}`;
        await writeFile(tempPath, buffer);

        const mimeType = mime.lookup(file.name);
        let extractedText = '';

        if (mimeType === 'application/pdf') {
            extractedText = await extractTextFromPDF(tempPath);
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            extractedText = await extractTextFromDocx(tempPath);
        } else {
            return NextResponse.json(
                { error: 'Unsupported file type' },
                { status: 400 }
            );
        }

        await unlink(tempPath); // clean up temp file
        return NextResponse.json({ text: extractedText });
    } catch (error) {
        console.error('Error processing file:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}