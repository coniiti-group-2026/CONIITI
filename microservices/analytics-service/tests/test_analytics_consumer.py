import asyncio
import json

from app.messaging import consumer


class _MessageContext:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return False


class FakeIncomingMessage:
    def __init__(self, payload: bytes):
        self.body = payload

    def process(self):
        return _MessageContext()


def test_process_message_persists_json_object(monkeypatch):
    saved_events = []

    async def fake_save_to_mongo(data: dict) -> None:
        saved_events.append(data)

    monkeypatch.setattr(consumer, "save_to_mongo", fake_save_to_mongo)
    message = FakeIncomingMessage(json.dumps({"event": "usuario.registrado"}).encode())

    asyncio.run(consumer.process_message(message))

    assert saved_events == [{"event": "usuario.registrado"}]


def test_process_message_ignores_invalid_json(monkeypatch):
    saved_events = []

    async def fake_save_to_mongo(data: dict) -> None:
        saved_events.append(data)

    monkeypatch.setattr(consumer, "save_to_mongo", fake_save_to_mongo)
    message = FakeIncomingMessage(b"{invalid-json")

    asyncio.run(consumer.process_message(message))

    assert saved_events == []
