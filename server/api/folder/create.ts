import { createFolder } from "../../data/files";

export default defineEventHandler(async (event) => {
    const user_id = event.context.user_id;
    const body = await readBody(event);
    const name =  body.name;
    const idParent = body.idParent;
    let statut = body.statut;
    const newFolder = await createFolder(name, idParent, statut, user_id);
    return "ok";
  })