import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { err, ok } from "neverthrow";
import * as v from "valibot";
import { ServerFunctionError } from "@/src/error";
import { renderPdf } from "@/src/server/lib/pdf";
import { PRINT_PATH, PrintSearchSchema } from "@/src/shared/features/skill-sheet/print.schema";

// 保存済みのスキルシートを、印刷用の画面（/skill-sheet/print）から PDF にする。
export const renderPdfFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof PrintSearchSchema>) => data)
  .handler(async (ctx) => {
    const parsed = v.safeParse(PrintSearchSchema, ctx.data);
    if (!parsed.success) {
      return err(new ServerFunctionError(parsed.issues[0]?.message ?? "入力が不正です"));
    }
    const url = new URL(PRINT_PATH, getRequestUrl().origin);
    for (const [key, value] of Object.entries(parsed.output)) {
      url.searchParams.set(key, String(value));
    }
    const pdf = await renderPdf(url);
    return pdf.isOk() ? ok({ base64: pdf.value }) : err(pdf.error);
  });
