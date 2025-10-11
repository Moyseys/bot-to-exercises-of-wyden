import type { PracticeResponse } from "./types.js";

export class Api {
  private readonly token = process.env.TOKEN;
  private readonly xToken = process.env.X_TOKEN;

  async practices(theme: string, tenant: string = "wyden") {
    const data = {
      theme: theme,
      tenant: tenant,
    };

    return await fetch(
      "https://api-sirius.prd.qlabs.com.br/sirius-practice-api/practices",
      {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3",
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          Origin: "https://wyden.saladeavaliacoes.com.br",
          Referer: "https://wyden.saladeavaliacoes.com.br/",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0",
          "x-authorization": `${this.xToken}`,
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );
  }

  async selectAlternative(
    practiceId: string,
    answerId: string,
    alternativeId: string
  ) {
    return await fetch(
      `https://api-sirius.prd.qlabs.com.br/sirius-practice-api/practices/${practiceId}/answer/${answerId}/alternative/${alternativeId}`,
      {
        method: "PATCH",
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3",
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          Origin: "https://wyden.saladeavaliacoes.com.br",
          Referer: "https://wyden.saladeavaliacoes.com.br/",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0",
          "x-authorization": `${this.xToken}`,
        },
        credentials: "include",
      }
    );
  }

  async getPractice(practiceId: string): Promise<PracticeResponse> {
    const response = await fetch(
      `https://api-sirius.prd.qlabs.com.br/sirius-practice-api/practices/${practiceId}`,
      {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3",
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          Origin: "https://wyden.saladeavaliacoes.com.br",
          Referer: "https://wyden.saladeavaliacoes.com.br/",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0",
          "x-authorization": `${this.xToken}`,
        },
        credentials: "include",
      }
    );
    return (await response.json()) as PracticeResponse;
  }

  async finish(practiceId: string) {
    return await fetch(
      `https://api-sirius.prd.qlabs.com.br/sirius-practice-api/practices/${practiceId}/finish`,
      {
        method: "PATCH",
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3",
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          Origin: "https://wyden.saladeavaliacoes.com.br",
          Referer: "https://wyden.saladeavaliacoes.com.br/",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0",
          "x-authorization": `${this.xToken}`,
        },
        credentials: "include",
      }
    );
  }
}
