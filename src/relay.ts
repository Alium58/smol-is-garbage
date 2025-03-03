import { Args } from "grimoire-kolmafia";
import {
  ComponentHtml,
  ComponentSetting,
  generateHTML,
  handleApiRequest,
  RelayPage,
} from "mafia-shared-relay";
import { args } from "./args";
import { checkReqs } from "./tasks/sim";
import { write } from "kolmafia";

function convertArgsToHtml(): RelayPage[] {
  const metadata = Args.getMetadata(args);
  const sim: ComponentHtml = {
    type: "html",
    data: checkReqs(false),
  };

  const pages: RelayPage[] = [
    { page: metadata.options.defaultGroupName ?? "Options", components: [] },
    { page: "Requirements", components: [sim] },
  ];

  metadata.traverse(
    (key, name: string) => {
      if (key.setting === "" || key.hidden) return;

      const component: ComponentSetting = {
        type: "string",
        name: key.key ?? name,
        description: key.help || "No Description Provided",
        preference: key.setting ?? `${metadata.scriptName}_${key.key ?? name}`,
        default: "default" in key ? `${key["default"]}` : undefined,
      };

      if (key.valueHelpName === "FLAG" || key.valueHelpName === "BOOLEAN") {
        component.type = "boolean";
      } else if (key.options !== undefined) {
        component.type = "dropdown";
        component.dropdown = key.options.map(([k, desc]) => {
          return { display: desc ?? k, value: k };
        });
      }
      pages[0].components.push(component);
    },
    (group, name: string) => {
      pages.push({ page: name, components: [] });
    }
  );

  pages
    .filter((p) => p.components.length > 0)
    .forEach((p) => {
      const html: ComponentHtml = {
        type: "html",
        data: `<h1 style="text-align: center;">smolisgarbage ${p.page}</div>`,
      };
      p.components.splice(0, 0, html);
    });

  return pages.filter((page) => page.components.length > 0);
}

export function main() {
  if (handleApiRequest()) return;

  write(generateHTML(convertArgsToHtml()));
}
