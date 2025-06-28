import { buscarFilmePorNome } from './api.js';

async function main() {
  const filme = await buscarFilmePorNome("Matrix");
  console.log(filme);
}

main();
