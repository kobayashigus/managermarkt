import requests
from bs4 import BeautifulSoup

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}


def get_leagues_by_country_urls(country_codes: list[str]) -> dict[str, str]:
    """
    Descobre dinamicamente a primeira divisão dos países passados na lista.
    """
    leagues = {}

    for country in country_codes:
        url = f"https://www.transfermarkt.com/wettbewerbe/national/wettbewerbe/{country}"
        try:
            res = requests.get(url, headers=HEADERS, timeout=10)
            if res.status_code != 200:
                continue

            soup = BeautifulSoup(res.content, 'html.parser')
            table = soup.find('table', class_='items')
            if table and table.find('tbody'):
                first_row = table.find('tbody').find('tr')
                if first_row:
                    link = first_row.find('td', class_='hauptlink').find('a')
                    league_name = link.text.strip()
                    league_href = link['href']
                    leagues[league_name] = f"https://www.transfermarkt.com{league_href}"
        except Exception as e:
            print(f"[Aviso] Falha ao descobrir liga para o país '{country}': {e}")

    return leagues