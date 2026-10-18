import { Link, useMatches } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
} from "@/src/components/ui/Breadcrumb/index";

// ルートの staticData.crumb を上から順に並べる。トップだけのときは出さない。
export function PageBreadcrumb() {
  const crumbs = useMatches({
    select: (all) =>
      all.flatMap((match) =>
        match.staticData.crumb ? [{ label: match.staticData.crumb, to: match.pathname }] : [],
      ),
  });
  if (crumbs.length < 2) {
    return null;
  }
  const current = crumbs[crumbs.length - 1];
  return (
    <Breadcrumb>
      {crumbs.slice(0, -1).map((crumb) => (
        <BreadcrumbItem key={crumb.to}>
          <Link to={crumb.to}>{crumb.label}</Link>
        </BreadcrumbItem>
      ))}
      <BreadcrumbCurrent>{current.label}</BreadcrumbCurrent>
    </Breadcrumb>
  );
}
