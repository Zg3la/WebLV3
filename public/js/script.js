let sviFilmovi = [];

fetch('data/movies.csv')
    .then(res => res.text())
    .then(csv => {
        const rezultat = Papa.parse(csv, {
            header: true,
            skipEmptyLines: true
        });

        sviFilmovi = rezultat.data.map(film => ({
            naslov:  film['Naslov']  ? film['Naslov'].trim()  : '',
            zanr:    film['Zanr']   ? film['Zanr'].trim()    : '',
            godina:  Number(film['Godina']),
            trajanje: Number(film['Trajanje_min']),
            ocjena:  Number(film['Ocjena']),
            redatelj: film['Rezisery'] ? film['Rezisery'].trim() : '',
            zemlja:  film['Zemlja_porijekla'] ? film['Zemlja_porijekla'].trim() : ''
        }));

        prikaziTablicu(sviFilmovi.slice(0, 15));
    })
    .catch(err => {
        console.error('Greška pri dohvaćanju CSV-a:', err);
    });

function prikaziTablicu(filmovi) {
    const tbody = document.querySelector('#filmovi-tablica tbody');
    tbody.innerHTML = '';

    if (filmovi.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nema filmova za prikaz.</td></tr>';
        return;
    }

    for (const film of filmovi) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${film.naslov}</td>
            <td>${film.zanr}</td>
            <td>${film.godina}</td>
            <td>${film.trajanje} min</td>
            <td>${film.ocjena}</td>
            <td>${film.redatelj}</td>
            <td>${film.zemlja}</td>
        `;
        tbody.appendChild(row);
    }
}

const sliderOcjena = document.getElementById('filter-ocjena');
const prikazOcjene = document.getElementById('ocjena-vrijednost');

sliderOcjena.addEventListener('input', () => {
    prikazOcjene.textContent = parseFloat(sliderOcjena.value).toFixed(1);
});

function filtriraj() {
    const zanr    = document.getElementById('filter-zanr').value.trim().toLowerCase();
    const godinaOd = parseInt(document.getElementById('filter-godina').value) || 0;
    const minOcjena = parseFloat(document.getElementById('filter-ocjena').value);

    const filtrirani = sviFilmovi.filter(film => {
        const zanrMatch    = !zanr    || film.zanr.toLowerCase().includes(zanr);
        const godinaMatch  = !godinaOd || film.godina >= godinaOd;
        const ocjenaMatch  = film.ocjena >= minOcjena;
        return zanrMatch && godinaMatch && ocjenaMatch;
    });

    prikaziFiltriraneFilmove(filtrirani);
    document.getElementById('filtrirani-container').style.display = 'block';
}

document.getElementById('primijeni-filtere').addEventListener('click', filtriraj);

document.getElementById('reset-filtere').addEventListener('click', () => {
    document.getElementById('filter-zanr').value   = '';
    document.getElementById('filter-godina').value  = '';
    document.getElementById('filter-ocjena').value  = 7;
    prikazOcjene.textContent = '7.0';
    document.getElementById('filtrirani-container').style.display = 'none';
});

function prikaziFiltriraneFilmove(filmovi) {
    const tbody = document.getElementById('filtrirani-tbody');
    tbody.innerHTML = '';

    if (filmovi.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nema filmova za odabrane filtere.</td></tr>';
        return;
    }

    for (const film of filmovi) {
        const row = document.createElement('tr');
        const vecUKosarici = kosarica.some(f => f.naslov === film.naslov);
        row.innerHTML = `
            <td>${film.naslov}</td>
            <td>${film.zanr}</td>
            <td>${film.godina}</td>
            <td>${film.trajanje} min</td>
            <td>${film.ocjena}</td>
            <td>${film.zemlja}</td>
            <td><button class="dodaj-btn" data-naslov="${film.naslov}" ${vecUKosarici ? 'disabled' : ''}>
                ${vecUKosarici ? '✓ Dodano' : '+ Dodaj'}
            </button></td>
        `;

        row.querySelector('.dodaj-btn').addEventListener('click', () => {
            dodajUKosaricu(film);
        });

        tbody.appendChild(row);
    }
}

let kosarica = [];

function dodajUKosaricu(film) {
    const vecPostoji = kosarica.some(f => f.naslov === film.naslov);
    if (vecPostoji) return;
    kosarica.push(film);
    osvjeziKosaricu();
    osvjeziGumbeUTablici();
}

function ukloniIzKosarice(index) {
    kosarica.splice(index, 1);
    osvjeziKosaricu();
    osvjeziGumbeUTablici();
}

function osvjeziGumbeUTablici() {
    const gumbi = document.querySelectorAll('#filtrirani-tbody .dodaj-btn');
    gumbi.forEach(gumb => {
        const naslov = gumb.dataset.naslov;
        const uKosarici = kosarica.some(f => f.naslov === naslov);
        gumb.disabled = uKosarici;
        gumb.textContent = uKosarici ? '✓ Dodano' : '+ Dodaj';
    });
}

function osvjeziKosaricu() {
    const lista       = document.getElementById('lista-kosarice');
    const praznaTekst = document.getElementById('kosarica-prazna');
    const brojEl      = document.getElementById('broj-u-kosarica');

    lista.innerHTML = '';
    brojEl.textContent = `(${kosarica.length})`;

    if (kosarica.length === 0) {
        praznaTekst.style.display = 'block';
        return;
    }

    praznaTekst.style.display = 'none';

    kosarica.forEach((film, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${film.naslov} (${film.godina})</span>
            <button class="ukloni-btn" title="Ukloni">✕</button>
        `;
        li.querySelector('.ukloni-btn').addEventListener('click', () => {
            ukloniIzKosarice(index);
        });
        lista.appendChild(li);
    });
}

document.getElementById('potvrdi-kosaricu').addEventListener('click', () => {
    if (kosarica.length === 0) {
        alert('Košarica je prazna! Dodajte filmove prije potvrde.');
        return;
    }
    const broj = kosarica.length;
    alert(`Uspješno ste dodali ${broj} ${broj === 1 ? 'film' : 'filma'} u svoju košaricu za vikend maraton!`);
    kosarica = [];
    osvjeziKosaricu();
    osvjeziGumbeUTablici();
});
