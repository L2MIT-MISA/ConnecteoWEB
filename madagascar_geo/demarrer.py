import logging

import uvicorn

import api
import config
import diagnostic


def afficher_diagnostic():
    for etat in diagnostic.diagnostiquer_services():
        print(f"  {'OK' if etat['ok'] else '!!'}  {etat["service"]:13s} {etat['message']}")

        if not etat["ok"]:
            print(f"      -> {etat['consequence_si_absent']}")

    print(f"\nSite de démonstration : http://localhost:{config.PORT_API}\n")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    logging.getLogger("httpx").setLevel(logging.WARNING)   # sinon la clé Google apparaît dans les journaux
    afficher_diagnostic()
    uvicorn.run(api.app, host="0.0.0.0", port=config.PORT_API)