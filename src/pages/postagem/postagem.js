import {
  sair,
  obterUsuaria,
  criarPostagem,
  buscarPostagens,
  excluindoPostagem,
  editandoPostagem,
  curtindoPostagem,
  descurtindoPostagem,
} from '../../firebase/firebase';
import logoPostagem from '../../imagens/mev-postagem.png';
import likeVazio from '../../imagens/tacavazia.png';
import likeCheio from '../../imagens/tacacheia.png';

// monta a tela das postagens
const postagem = async () => {
  const usuariaLogada = await obterUsuaria();
  const telaDaPostagem = document.createElement('div');
  telaDaPostagem.classList.add('container-postagem'); // adiciona classe à div.

  console.log(usuariaLogada);
  const template = `
    <div class="botao">
      <img src="${logoPostagem}" class="mev-postagem"alt="Mulheres brindando">
      <button class="btn-sair">Sair</button>
    </div>
    <div class="postagem">
      <div class="mensagem-ola">
        <p class="paragrafo">${usuariaLogada.nomeUsuaria}, o que deseja compartilhar?</p>
      </div>
    </div>
      <div class="novo-post">
        <textarea name="novo-texto" id="novo-texto" cols="30%" rows="4%"></textarea>
        <button class="btn-postar">Postar</button>
      </div>
    <div class='postagens'></div>

    `;
  //  header.style.display = 'block';

  telaDaPostagem.innerHTML = template;

  // para criar 'uma estrutura de html p/ cada post, essa estrutura nao pode
  // ficar junto da const postagem
  const exibirPostagem = (post) => {
    const posts = telaDaPostagem.querySelector('.postagens');
    const containerPost = document.createElement('div');
    let somaLikes = post.likes.length;
    const templatePost = `
    <div class="postagem-amigas">
      <div class="postagem-data">
        <p class="perfil-usuaria">${post.nomeUsuaria}</p>
        <p class="data-postagem">${post.data}</p>
      </div>
      <div class="postagens-anteriores">
        <textarea class="texto-usuaria-postado" id="texto-usuaria-postado" style='resize:none' disabled>${post.texto}</textarea>
        <span class="icones-inferiores">
        <button class="btn-curtir">
        <img id="taca-vazia" src="${likeVazio}">
        <img id="taca-cheia" src="${likeCheio}">
        </button>
        <button class="btn-excluir">
        <i class="fa-solid fa-trash-can" id="btn-excluir-${post.id}" type="button" value="${post.id}"></i>
        </button>
        <button id="btn-editar">
        <i class="fa-sharp fa-solid fa-pen-to-square" id="btn-editar" class="btn-editar "type="button" ></i>
        </button>
        <p class="numero-curtidas">${somaLikes}</p>
        <button id="btn-salvar" class="esconde-btn" "> Salvar </button>
        </span>
        </div>
        </div>
      `;
    containerPost.innerHTML = templatePost;
    posts.appendChild(containerPost);

    // evento escutador para excluir postaem
    const btnExcluir = containerPost.querySelector(`#btn-excluir-${post.id}`); // Usar template literals para pegar o elemento com o ID correto
    if (post.idUsuaria !== usuariaLogada.uid) {
      btnExcluir.style.display = 'none';
    }
    btnExcluir.addEventListener('click', () => {
      excluindoPostagem(post.id);
      containerPost.remove();
    });
    // p/ editar postagem
    const btnEditar = containerPost.querySelector('#btn-editar');
    const textArea = containerPost.querySelector('#texto-usuaria-postado');
    const btnSalvar = containerPost.querySelector('#btn-salvar');
    if (post.idUsuaria !== usuariaLogada.uid) {
      btnEditar.style.display = 'none';
    }
    btnEditar.addEventListener('click', () => {
      textArea.removeAttribute('disabled');
      btnSalvar.style.display = 'inline-block';
      btnEditar.style.display = 'none';
    });
    btnSalvar.addEventListener('click', () => {
      editandoPostagem(post.id, textArea.value);
      textArea.setAttribute('disabled', 'disabled');
      btnSalvar.style.display = 'none';
      btnEditar.style.display = 'inline-block';
    });

    // função likes
    const tacaVazia = containerPost.querySelector('#taca-vazia');
    const tacaCheia = containerPost.querySelector('#taca-cheia');
    const likeNaTela = containerPost.querySelector('.numero-curtidas');
    const colecaoLikes = post.likes;
    const uid = usuariaLogada.uid;
    const curtiuPost = colecaoLikes.includes(uid);

    // oculta inicialmente a taça cheia
    tacaCheia.style.display = 'none';

    // verifica se a usuária logada já curtiu o post
    if (curtiuPost) {
      tacaVazia.style.display = 'none';
      tacaCheia.style.display = 'block';
    }
    // adiciona o evento de clique na taça vazia
    tacaVazia.addEventListener('click', () => {
      tacaVazia.style.display = 'none';
      tacaCheia.style.display = 'block';
      somaLikes += 1;
      likeNaTela.innerHTML = somaLikes;
      curtindoPostagem(post.id, usuariaLogada);

      // Adiciona a usuária logada à coleção de likes no Firebase
      colecaoLikes.push(uid);
    });

    // adiciona o evento de clique na taça cheia
    tacaCheia.addEventListener('click', () => {
      tacaCheia.style.display = 'none';
      tacaVazia.style.display = 'block';
      somaLikes -= 1;
      likeNaTela.innerHTML = somaLikes;
      descurtindoPostagem(post.id, usuariaLogada.uid);
    });

    const btnSair = telaDaPostagem.querySelector('.btn-sair');
    btnSair.addEventListener('click', async () => {
      await sair();
      window.location.hash = '';
    });
  };

  const postagens = await buscarPostagens();
  postagens.forEach((postagemCriada) => exibirPostagem(postagemCriada));
  // console.log(postagens);

  const funcaoPostar = async () => {
    // console.log('clicou postar');
    const textoUsuaria = telaDaPostagem.querySelector('#novo-texto');
    const textoDaPostagem = textoUsuaria.value;
    const postagemCriada = await criarPostagem(textoDaPostagem);
    exibirPostagem(postagemCriada);
    textoUsuaria.value = '';
  };
  const btnPostar = telaDaPostagem.querySelector('.btn-postar');
  btnPostar.addEventListener('click', funcaoPostar);

  const btnSair = telaDaPostagem.querySelector('.btn-sair');
  btnSair.addEventListener('click', async () => {
    await sair();
    window.location.hash = '';
  });

  return telaDaPostagem;
};

export default postagem;
