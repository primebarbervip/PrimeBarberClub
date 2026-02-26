-- AddColumn emailApiKey to Configuracion
ALTER TABLE "Configuracion" ADD COLUMN "emailApiKey" TEXT NOT NULL DEFAULT '';
