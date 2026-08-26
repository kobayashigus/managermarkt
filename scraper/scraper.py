import time
import json
import requests
from bs4 import BeautifulSoup

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}


class TransfermarktJsonScraper:
    def __init__(self, delay_seconds: float = 1.5):
        self.delay = delay_seconds

    def extract_structured_data(self, leagues_map: dict[str, str]) -> list[dict]:
        dataset = []

        for league_name, league_url in leagues_map.items():
            print(f"[Scraping] Processando liga: {league_name}...")

            # Extrai o ID da liga diretamente da URL (ex: 'BRA1')
            league_id = league_url.split('/wettbewerb/')[1] if '/wettbewerb/' in league_url else None

            clubs = self._parse_league_clubs(league_url)

            # Estrutura Hierárquica JSON Nativa
            league_entry = {
                "league_id": league_id,
                "league_name": league_name,
                "league_url": league_url,
                "total_clubs": len(clubs),
                "clubs": clubs
            }

            dataset.append(league_entry)
            time.sleep(self.delay)

        return dataset

    def _parse_league_clubs(self, url: str) -> list[dict]:
        try:
            res = requests.get(url, headers=HEADERS, timeout=12)
            res.raise_for_status()
        except requests.RequestException as e:
            print(f"[Erro] Falha ao acessar {url}: {e}")
            return []

        soup = BeautifulSoup(res.content, 'html.parser')
        table = soup.find('table', class_='items')

        if not table or not table.find('tbody'):
            return []

        clubs = []
        rows = table.find('tbody').find_all('tr', recursive=False)

        for row in rows:
            cell = row.find('td', class_='hauptlink')
            if cell and cell.find('a'):
                link = cell.find('a')
                club_name = link.text.strip()
                href = link['href']

                club_id = href.split('/verein/')[1].split('/')[0] if '/verein/' in href else None
                full_url = f"https://www.transfermarkt.com{href}"
                staff_url = f"https://www.transfermarkt.com{href.replace('/startseite/', '/mitarbeiter/')}"

                clubs.append({
                    "club_id": int(club_id) if club_id and club_id.isdigit() else club_id,
                    "club_name": club_name,
                    "urls": {
                        "profile": full_url,
                        "staff": staff_url
                    },
                    "staff": []  # Reservado para acoplamento futuro de executivos/dirigentes
                })

        return clubs

    def export_to_json(self, data: list[dict], output_file: str = "clubs_dataset.json"):
        if not data:
            print("[Aviso] Nenhum dado para exportar.")
            return

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"[Sucesso] Dataset JSON salvo em '{output_file}'.")