import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { CAMPINAS, grantGeolocation } from "@/test/geolocation";
import { renderApp } from "@/test/render";
import { server, testDb } from "@/test/server";

const renderNewTruckPage = async () => {
  const view = renderApp("/caminhoes/novo");
  await screen.findByLabelText("Identificação");
  return view;
};

describe("New truck page", () => {
  it("validates every field before submitting", async () => {
    const { user } = await renderNewTruckPage();

    await user.click(
      screen.getByRole("button", { name: "Cadastrar caminhão" })
    );

    expect(
      await screen.findByText("Informe pelo menos 3 caracteres")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Placa inválida. Use ABC-1234 ou ABC1D23")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Use de 5 a 20 letras ou números")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Selecione a localização no mapa")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Identificação")).toHaveFocus();
  });

  it("formats the plate and tracker serial while typing", async () => {
    const { user } = await renderNewTruckPage();

    await user.type(screen.getByLabelText("Placa"), "abc1234");
    await user.type(
      screen.getByLabelText("Nº de série do rastreador"),
      "vt-540 sp"
    );

    expect(screen.getByLabelText("Placa")).toHaveValue("ABC-1234");
    expect(screen.getByLabelText("Nº de série do rastreador")).toHaveValue(
      "VT540SP"
    );
  });

  it("registers a truck and opens its page", async () => {
    const { user, router } = await renderNewTruckPage();

    await user.type(
      screen.getByLabelText("Identificação"),
      "Volvo FH 540 · Rio"
    );
    await user.type(screen.getByLabelText("Placa"), "abc1d23");
    await user.type(
      screen.getByLabelText("Nº de série do rastreador"),
      "VT999RJ"
    );
    await user.click(
      screen.getByRole("button", { name: "Simular clique no mapa" })
    );
    expect(
      screen.getByText("Latitude -22,90685 · Longitude -43,17290")
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Cadastrar caminhão" })
    );

    expect(
      await screen.findByText("Volvo FH 540 · Rio foi cadastrado.")
    ).toBeInTheDocument();
    const created = testDb
      .list()
      .find((truck) => truck.license_plate === "ABC1D23");
    expect(created).toMatchObject({
      identifier: "Volvo FH 540 · Rio",
      tracker_serial_number: "VT999RJ",
      coordinates: { latitude: -22.90685, longitude: -43.1729 },
    });
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/caminhoes/${created?.id}`)
    );
  });

  it("pre-fills the location with the device position", async () => {
    grantGeolocation();
    await renderNewTruckPage();

    expect(
      screen.getByText(
        `Latitude ${CAMPINAS.latitude.toLocaleString("pt-BR", { minimumFractionDigits: 5 })} · Longitude ${CAMPINAS.longitude.toLocaleString("pt-BR", { minimumFractionDigits: 5 })}`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Usar minha localização" })
    ).toBeEnabled();
  });

  it("disables 'use my location' when the position is unknown", async () => {
    await renderNewTruckPage();

    expect(
      screen.getByRole("button", { name: "Usar minha localização" })
    ).toBeDisabled();
  });

  it("shows the API conflict on the plate field", async () => {
    grantGeolocation();
    const { user } = await renderNewTruckPage();

    await user.type(screen.getByLabelText("Identificação"), "Duplicado");
    await user.type(screen.getByLabelText("Placa"), "FRT2A41");
    await user.type(
      screen.getByLabelText("Nº de série do rastreador"),
      "DUP12345"
    );
    await user.click(
      screen.getByRole("button", { name: "Cadastrar caminhão" })
    );

    expect(
      await screen.findByText("Já existe um caminhão com essa placa")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Placa")).toHaveFocus();
  });

  it("shows a generic error when saving fails unexpectedly", async () => {
    server.use(
      http.post("*/api/trucks", () => HttpResponse.json(null, { status: 500 }))
    );
    grantGeolocation();
    const { user } = await renderNewTruckPage();

    await user.type(screen.getByLabelText("Identificação"), "Volvo FH 540");
    await user.type(screen.getByLabelText("Placa"), "ABC1D23");
    await user.type(
      screen.getByLabelText("Nº de série do rastreador"),
      "VT999RJ"
    );
    await user.click(
      screen.getByRole("button", { name: "Cadastrar caminhão" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível salvar o caminhão. Tente novamente."
    );
  });

  it("rejects unsupported image files", async () => {
    await renderNewTruckPage();
    // Simulates a browser that ignores the input "accept" filter.
    const user = userEvent.setup({ applyAccept: false });
    const pdf = new File(["%PDF"], "manual.pdf", { type: "application/pdf" });

    await user.upload(screen.getByLabelText("Foto (opcional)"), pdf);

    expect(
      await screen.findByText("Envie uma imagem JPG, PNG ou WEBP.")
    ).toBeInTheDocument();
  });

  it("attaches and removes a photo", async () => {
    const { user } = await renderNewTruckPage();
    const photo = new File(["fake"], "truck.png", { type: "image/png" });

    await user.upload(screen.getByLabelText("Foto (opcional)"), photo);
    await user.click(await screen.findByRole("button", { name: "Remover" }));

    expect(
      screen.getByRole("button", { name: "Enviar foto" })
    ).toBeInTheDocument();
  });

  it("goes back when cancelled", async () => {
    const { user, router } = renderApp("/caminhoes");
    await screen.findByRole("table");
    await user.click(
      within(screen.getByRole("main")).getByRole("link", {
        name: "Novo caminhão",
      })
    );
    await screen.findByLabelText("Identificação");

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/caminhoes")
    );
  });
});
