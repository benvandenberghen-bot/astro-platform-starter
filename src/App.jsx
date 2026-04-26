import { useEffect, useMemo, useState } from 'react';
import { Stage, Layer, Rect, Text, Arrow, Group, Line } from 'react-konva';
import './styles.css';

const STORAGE_KEY = 'renovatie-ruimtes';
const SCALE = 50; // 1 meter = 50 pixels
const GRID_SIZE = 20;
const STAGE_WIDTH = 1000;
const STAGE_HEIGHT = 700;

function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function calculateRoom({ length, width, height }) {
  const floorArea = length * width;
  const perimeter = 2 * (length + width);
  const wallArea = perimeter * height;

  return {
    floorArea,
    perimeter,
    wallArea,
  };
}

const defaultForm = {
  name: '',
  length: '',
  width: '',
  height: '',
};

export default function App() {
  const [form, setForm] = useState(defaultForm);
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  }, [rooms]);

  const addRoom = () => {
    const name = form.name.trim();
    const length = Number(form.length);
    const width = Number(form.width);
    const height = Number(form.height);

    if (!name || length <= 0 || width <= 0 || height <= 0) {
      alert('Vul een naam en geldige afmetingen in (> 0).');
      return;
    }

    const calculations = calculateRoom({ length, width, height });

    const newRoom = {
      id: crypto.randomUUID(),
      name,
      length,
      width,
      height,
      x: snapToGrid(80 + rooms.length * 30),
      y: snapToGrid(80 + rooms.length * 30),
      ...calculations,
    };

    setRooms((prev) => [...prev, newRoom]);
    setForm(defaultForm);
  };

  const updateRoomPosition = (id, x, y) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id
          ? {
              ...room,
              x: snapToGrid(x),
              y: snapToGrid(y),
            }
          : room,
      ),
    );
  };

  const clearRooms = () => {
    setRooms([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const gridLines = useMemo(() => {
    const lines = [];

    for (let x = 0; x <= STAGE_WIDTH; x += GRID_SIZE) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, STAGE_HEIGHT]}
          stroke={x % (GRID_SIZE * 5) === 0 ? '#d8dee6' : '#edf1f6'}
          strokeWidth={1}
        />,
      );
    }

    for (let y = 0; y <= STAGE_HEIGHT; y += GRID_SIZE) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, STAGE_WIDTH, y]}
          stroke={y % (GRID_SIZE * 5) === 0 ? '#d8dee6' : '#edf1f6'}
          strokeWidth={1}
        />,
      );
    }

    return lines;
  }, []);

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Renovatie opmeting</h1>
        <p>Voeg ruimtes toe en versleep ze op het raster.</p>

        <div className="form">
          <label>
            Naam ruimte
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="bv. Woonkamer"
            />
          </label>

          <label>
            Lengte (m)
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.length}
              onChange={(e) => setForm((prev) => ({ ...prev, length: e.target.value }))}
            />
          </label>

          <label>
            Breedte (m)
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.width}
              onChange={(e) => setForm((prev) => ({ ...prev, width: e.target.value }))}
            />
          </label>

          <label>
            Hoogte (m)
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.height}
              onChange={(e) => setForm((prev) => ({ ...prev, height: e.target.value }))}
            />
          </label>

          <button onClick={addRoom}>Ruimte toevoegen</button>
          <button className="danger" onClick={clearRooms}>Alles wissen</button>
        </div>
      </aside>

      <main className="canvas-wrap">
        <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} className="canvas">
          <Layer>{gridLines}</Layer>

          <Layer>
            {rooms.map((room) => {
              const rectWidth = room.length * SCALE;
              const rectHeight = room.width * SCALE;

              return (
                <Group
                  key={room.id}
                  x={room.x}
                  y={room.y}
                  draggable
                  onDragEnd={(e) =>
                    updateRoomPosition(room.id, e.target.x(), e.target.y())
                  }
                >
                  <Rect
                    width={rectWidth}
                    height={rectHeight}
                    fill="#cde5ff"
                    stroke="#2f6fb3"
                    strokeWidth={2}
                    cornerRadius={4}
                  />

                  <Arrow points={[0, -18, rectWidth, -18]} pointerLength={8} pointerWidth={8} stroke="#1f2d3d" fill="#1f2d3d" />
                  <Text text={`${room.length.toFixed(2)} m`} x={rectWidth / 2 - 30} y={-36} fontSize={12} fill="#1f2d3d" />

                  <Arrow points={[rectWidth + 18, 0, rectWidth + 18, rectHeight]} pointerLength={8} pointerWidth={8} stroke="#1f2d3d" fill="#1f2d3d" />
                  <Text text={`${room.width.toFixed(2)} m`} x={rectWidth + 24} y={rectHeight / 2 - 8} fontSize={12} fill="#1f2d3d" />

                  <Text
                    text={`${room.name}\n${room.floorArea.toFixed(2)} m²`}
                    width={rectWidth}
                    height={rectHeight}
                    align="center"
                    verticalAlign="middle"
                    fontSize={14}
                    fill="#123"
                  />
                </Group>
              );
            })}
          </Layer>
        </Stage>

        <section className="room-list">
          <h2>Overzicht ruimtes</h2>
          {rooms.length === 0 ? (
            <p>Nog geen ruimtes toegevoegd.</p>
          ) : (
            <ul>
              {rooms.map((room) => (
                <li key={room.id}>
                  <strong>{room.name}</strong>
                  <span>Vloer: {room.floorArea.toFixed(2)} m²</span>
                  <span>Omtrek: {room.perimeter.toFixed(2)} lm</span>
                  <span>Bruto wandopp.: {room.wallArea.toFixed(2)} m²</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
