import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class FilesStorageConfig:
    upload_dir: Path
    data_dir: Path
    assets_store: Path
    documents_store: Path
    content_cards_store: Path
    content_sections: set[str]
    document_categories: set[str]


def build_storage_config() -> FilesStorageConfig:
    upload_dir = Path(os.getenv("UPLOAD_DIR", "/app/uploads"))
    data_dir = Path(os.getenv("FILES_DATA_DIR", str(upload_dir / "_metadata")))
    upload_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(parents=True, exist_ok=True)

    return FilesStorageConfig(
        upload_dir=upload_dir,
        data_dir=data_dir,
        assets_store=data_dir / "assets.json",
        documents_store=data_dir / "documents.json",
        content_cards_store=data_dir / "content_cards.json",
        content_sections={"memorias", "galerias", "comite", "conferencistas", "autores"},
        document_categories={"sistema", "ponente"},
    )


class JsonRecordStore:
    def load_records(self, path: Path) -> list[dict[str, Any]]:
        if not path.exists():
            return []

        try:
            with path.open("r", encoding="utf-8") as handle:
                data = json.load(handle)
        except json.JSONDecodeError:
            return []

        return data if isinstance(data, list) else []

    def save_records(self, path: Path, records: list[dict[str, Any]]) -> None:
        with path.open("w", encoding="utf-8") as handle:
            json.dump(records, handle, ensure_ascii=True, indent=2)


class LocalBinaryStorage:
    def __init__(self, upload_dir: Path):
        self._upload_dir = upload_dir

    def resolve_path(self, filename: str) -> Path:
        safe_name = os.path.basename(filename)
        return self._upload_dir / safe_name

    def delete(self, filename: str) -> None:
        target = self.resolve_path(filename)
        if target.exists():
            target.unlink()
