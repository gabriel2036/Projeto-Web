// Caminho correto, sobe um nível de pasta
import { buscarFilmePorNome } from '../api.js';

async function main() {
  const filme = await buscarFilmePorNome("Pulp Fiction: Tempo de Violência");
  console.log(filme);
}

main();
