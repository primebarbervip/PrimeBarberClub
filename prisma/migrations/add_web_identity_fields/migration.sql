-- AddColumn webNombre and webLogo to Configuracion
ALTER TABLE "Configuracion" ADD COLUMN "webNombre" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Configuracion" ADD COLUMN "webLogo" TEXT;
