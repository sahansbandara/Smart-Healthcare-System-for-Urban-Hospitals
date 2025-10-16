import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    console.log('Testing database connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    await dbConnect();
    
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    return NextResponse.json({
      status: 'success',
      connectionState: states[state],
      database: mongoose.connection.db?.databaseName,
      host: mongoose.connection.host,
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
