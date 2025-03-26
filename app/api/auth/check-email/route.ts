import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { message: 'Email é obrigatório' },
        { status: 400 }
      );
    }
    
    // Conectar ao banco de dados
    await connectToDatabase();
    
    // Verificar se o email existe
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Email não encontrado no sistema' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Email encontrado',
      exists: true
    });
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}