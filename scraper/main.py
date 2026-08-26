import json
from dynamic_discovery import get_leagues_by_country_urls
from scraper import TransfermarktJsonScraper


def load_config(config_path: str = "config.json") -> dict:
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "target_countries": ["brazil", "england"],
            "output_filename": "clubes_dataset.json",
            "request_delay": 1.5
        }


if __name__ == "__main__":
    config = load_config()

    # 1. Descobrimento dinâmico das ligas
    print("[1/3] Descobrindo ligas...")
    discovered_leagues = get_leagues_by_country_urls(config["target_countries"])

    # 2. Raspagem e geração do schema aninhado
    print("[2/3] Executando scraping em JSON...")
    scraper = TransfermarktJsonScraper(delay_seconds=config.get("request_delay", 1.5))
    json_data = scraper.extract_structured_data(discovered_leagues)

    # 3. Escrita do JSON final
    print("[3/3] Exportando arquivo JSON...")
    scraper.export_to_json(json_data, output_file=config.get("output_filename", "clubs.json"))