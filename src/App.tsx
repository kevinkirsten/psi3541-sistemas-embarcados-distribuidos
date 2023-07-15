import { useState } from "react";

type LightStatus = "on" | "off";

type Light = {
  id: number;
  name: string;
  state: LightStatus;
};

type LightResponse = {
  id: number;
  value: boolean;
};

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [lights, setLights] = useState<Light[]>([]);
  const [host, setHost] = useState<string>();

  const onHostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) return;
    console.log(event.target.value);
    setHost(event.target.value);
  };

  const onLightNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) return;
    const lightId = event.target.id;
    console.log(lightId);
    setLights((prevState) =>
      prevState.map((light) => {
        if (light.id === Number(lightId)) {
          return {
            ...light,
            name: event.target.value,
          };
        }
        return light;
      })
    );
  };

  const fetchLights = async () => {
    setLoading(true);
    try {
      if (!host) return;
      const response = await fetch(`${host}/devices`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      const data: LightResponse[] = await response.json();

      if (lights.length === 0) {
        setLights(
          data.map((light) => ({
            id: light.id,
            name: `Lâmpada ${light.id}`,
            state: light.value ? "on" : "off",
          }))
        );
      } else {
        setLights((prevState) =>
          prevState.map((light) => {
            const lightResponse = data.find(
              (lightResponse) => lightResponse.id === light.id
            );
            if (lightResponse) {
              return {
                ...light,
                state: lightResponse.value ? "on" : "off",
              };
            }
            return light;
          })
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const changeLightStatus = async (lightId: number, status: LightStatus) => {
    try {
      if (!host) return;

      const response = await fetch(`${host}/devices/${lightId}/${status}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      if (response.status === 200) {
        setLights((prevState) =>
          prevState.map((light) => {
            if (light.id === lightId) {
              return {
                ...light,
                state: status,
              };
            }
            return light;
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-blue-50 min-h-screen flex gap-2 flex-col items-center p-4">
      <h1 className="text-center text-lg font-medium">
        Projeto Final <br />
        PSI3541 - Sistemas Embarcados Distribuidos
      </h1>
      <div className="flex flex-col">
        <p className="text-center text-lg font-medium">Alunos:</p>
        <p className="text-center text-lg">Kevin Kirsten Lucas 10853306</p>
        <p className="text-center text-lg">Luiz Otavio A. Rodrigues 11262059</p>
        <p className="text-center text-lg">Bruno Madeira Pires da Silva 4376491</p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          name="host"
          id="host"
          placeholder="Digite o Host aqui"
          className="p-2 border border-gray-300 rounded-md w-64"
          onChange={onHostChange}
        />
        <button
          className="p-2 bg-slate-900 text-white active:scale-95 rounded-md hover:bg-slate-800"
          onClick={fetchLights}
        >
          Conectar
        </button>
      </div>

      {loading && <p>Carregando...</p>}

      {lights && host && (
        <div className="grid grid-cols-2 gap-2">
          {lights.map((light) => (
            <div
              key={light.id}
              className={`flex gap-2 flex-col p-2 rounded-md ${
                light.state === "on" ? "bg-yellow-200" : "bg-slate-500"
              }`}
            >
              <input
                id={String(light.id)}
                className="text-center rounded-md"
                type="text"
                value={light.name}
                onChange={onLightNameChange}
              />
              <button
                onClick={
                  light.state === "on"
                    ? () => changeLightStatus(light.id, "off")
                    : () => changeLightStatus(light.id, "on")
                }
                className="p-2 bg-slate-900 text-white active:scale-95 rounded-md hover:bg-slate-800"
              >
                {light.state === "on" ? "Desligar" : "Ligar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
