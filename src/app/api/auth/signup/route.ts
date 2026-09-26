import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.email || !data.password || !data.name) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    
    // Path to our mock database file
    const dbPath = path.join(process.cwd(), 'users_db.json');
    
    let users = [];
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, 'utf8');
      users = JSON.parse(fileData);
    }
    
    // Check if user exists
    const existingIndex = users.findIndex((u: any) => u.email === data.email);
    if (existingIndex >= 0) {
      return NextResponse.json({ success: false, message: 'User with this email already exists' }, { status: 409 });
    }
    
    // Create new user (storing password in plain text for hackathon speed as requested)
    const newUser = {
      ...data,
      id: `${data.role === 'recruiter' ? 'recruiter' : 'cand'}-${data.email.replace(/[^a-zA-Z0-9]/g, '')}`,
      avatar: data.name.slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    users.push(newUser);
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
    
    const { password: _, ...safeUser } = newUser;
    return NextResponse.json({ success: true, user: safeUser, message: 'Signup successful' });
  } catch (error) {
    console.error('Error in auth API:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
