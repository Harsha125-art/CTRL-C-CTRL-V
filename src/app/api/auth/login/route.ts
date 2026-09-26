import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Path to our mock database file
    const dbPath = path.join(process.cwd(), 'users_db.json');
    
    let users = [];
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, 'utf8');
      users = JSON.parse(fileData);
    }
    
    // Find the user
    const user = users.find((u: any) => u.email === data.email);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (user.password !== data.password) {
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
    
    // Remove password before sending back
    const { password: _, ...safeUser } = user;
    
    return NextResponse.json({ success: true, user: safeUser, message: 'Login successful' });
  } catch (error) {
    console.error('Error in auth API:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
