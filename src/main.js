import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import axios from 'axios';

const pageForm = document.querySelector(".form");
const pageLoaderTop = document.querySelector(".loader-top");
const pageLoaderBottom = document.querySelector(".loader-bottom");
const pageGallery = document.querySelector(".gallery");
const pageLoadImg = document.querySelector('.load-image');


let page = 1;
let q = "cat";
let per_page = 40;

const lightbox = new SimpleLightbox(".gallery a", {
    captionsData: "alt",
    captionDelay: 250,
    nav: true,
    close: true,
    enableKeyboard: true,
    docClose: true
    });

pageForm.addEventListener('submit', onSubmit);
pageLoadImg.addEventListener('click', loadMore);

async function onSubmit(event) {
    event.preventDefault();
    pageLoaderTop.style.display = 'block';
    pageLoadImg.style.display = 'none';
    page = 1;
    q = event.target.elements.search.value.trim();

      if (!q) {
    pageGallery.innerHTML = '';
    iziToast.info({
      position: 'topRight',
      message: 'Error enter any symbols',
    });
    pageLoaderTop.style.display = 'none';
    return;
    }
    
    try {
    const {
    data: { hits, totalHits },
    } = await searchImg(q, page);
        
    if (hits.length > 0) {
    pageLoaderTop.style.display = 'none';
    pageGallery.innerHTML = renderImg(hits);
    lightbox.refresh();
    iziToast.success({
    position: 'topRight',
    message: `We found ${totalHits} photos`,
    });
    pageLoadImg.style.display = 'block';
    } else {
    pageGallery.innerHTML = '';
      iziToast.error({
        position: 'topRight',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
      });
        }
        
    if (totalHits <= per_page) {
      pageLoadImg.style.display = 'none';
    }
    } catch (error) {
        console.log('Error');
    } finally {
        pageLoaderTop.style.display = 'none';
        event.target.reset();
    }
}

function searchImg(q, page) {
  axios.defaults.baseURL = 'https://pixabay.com';

  return axios.get('/api/', {
    params: {
      key: '34228101-50b55348103eeb6dd10b59f8d',
      q,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page,
      per_page: 40,
    },
  });
}

function renderImg(hits = []) {
  return hits.reduce((html, hit) => {
    return (
      html +
      `<li class="gallery-item">
        <a href=${hit.largeImageURL}>
          <img class="gallery-img" src =${hit.webformatURL} alt=${hit.tags}/>
        </a>
        <div class="gallery-text-box">
          <p>Likes: <span class="text-value">${hit.likes}</span></p>
          <p>views: <span class="text-value">${hit.views}</span></p>
          <p>comments: <span class="text-value">${hit.comments}</span></p>
          <p>downloads: <span class="text-value">${hit.downloads}</span></p>
      </div>
      </li>`
    );
  }, '');
}

async function loadMore(event) {
  pageLoaderBottom.style.display = 'block';
  loadImg.style.display = 'none';
  const listItem = document.querySelector('.gallery-item:first-child');
  const itemHeight = listItem.getBoundingClientRect().height;

  try {
    page += 1;

    const {
      data: { hits, totalHits },
    } = await searchImg(q, page);
    const totalPage = Math.ceil(totalHits / per_page);

    pageLoadImg.style.display = 'block';
    pageGallery.insertAdjacentHTML('beforeend', renderImg(hits));
    lightbox.refresh();

    if (page === totalPage) {
      pageLoadImg.style.display = 'none';
      return iziToast.info({
        position: 'topRight',
        message: `We're sorry, but you've reached the end of search results.`,
      });
    }
  } catch (error) {
    console.log(error);
  } finally {
    pageLoaderBottom.style.display = 'none';
    window.scrollBy({
      top: 2 * itemHeight,
      behavior: 'smooth',
    });
  }
}
