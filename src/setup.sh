echo "🔧 Iniciando o setup do projeto YouVerse..."

# 1. Verifica se Node está instalado
if ! command -v node &> /dev/null
then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js antes de continuar."
    exit 1
fi

# 2. Verifica se .env existe
if [ ! -f .env ]; then
  echo "❌ Arquivo .env não encontrado. Por favor, clone corretamente o repositório ou crie um arquivo .env com as variáveis necessárias."
  exit 1
else
  echo "✅ Arquivo .env encontrado."
fi

# 3. Instala dependências
echo "📦 Instalando dependências..."
npm install

# 4. Executa o Prisma com Supabase
echo "🔄 Verificando conexão com o banco e rodando migrations..."
npx prisma generate

npx prisma migrate deploy

# 5. Mostra comandos úteis
echo "🛠️ Comandos úteis:"
echo "  ▶ npx prisma studio        # Para visualizar dados (requer login na Supabase)"
echo "  ▶ npx prisma db push       # Para sincronizar schema sem migrar (útil em ambientes de preview)"

# 6. Inicia o projeto
echo "🚀 Iniciando servidor de desenvolvimento..."
npm run dev