"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Inbox, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "./image-upload";
import { useI18n, LANGS } from "@/lib/i18n";
import { listPosts, savePost, deletePost } from "@/lib/hotels-db";
import { slugify, type BlogPost, type Lang } from "@/lib/types";

const EMPTY = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  lang: "ckb" as Lang,
  published: true,
};

export function BlogPanel() {
  const { t } = useI18n();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setPosts(await listPosts());
    } catch {
      /* keep what we have */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: string) {
    setPosts((p) => p.filter((x) => x.id !== id)); // optimistic
    try {
      await deletePost(id);
      toast.success(t("admin_deleted"));
    } catch {
      toast.error(t("fb_error"));
      void load();
    }
  }

  if (loading)
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("admin_blog")}</h2>
        <PostDialog
          onSaved={load}
          trigger={
            <Button>
              <Plus className="size-4" />
              {t("blog_new")}
            </Button>
          }
        />
      </div>

      {posts.length === 0 ? (
        <Card className="grid place-items-center gap-2 py-16 text-muted-foreground">
          <Inbox className="size-8" />
          <p>{t("blog_none")}</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {posts.map((p) => (
            <Card key={p.id} className="flex flex-row items-center gap-4 p-3">
              {p.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.coverImage}
                  alt=""
                  className="size-16 shrink-0 rounded-lg bg-muted object-cover"
                />
              ) : (
                <div className="size-16 shrink-0 rounded-lg bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-semibold">{p.title}</span>
                  <Badge variant="secondary">{LANGS[p.lang]?.label ?? p.lang}</Badge>
                  {p.published ? (
                    <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600">
                      <Eye className="size-3" /> {t("blog_published")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <EyeOff className="size-3" /> {t("blog_draft")}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  /blog/{p.slug}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <PostDialog
                  post={p}
                  onSaved={load}
                  trigger={
                    <Button variant="ghost" size="icon" title={t("admin_edit")}>
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  title={t("admin_delete")}
                  onClick={() => remove(p.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PostDialog({
  post,
  trigger,
  onSaved,
}: {
  post?: BlogPost;
  trigger: React.ReactElement;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({ ...EMPTY }));

  useEffect(() => {
    if (!open) return;
    setForm(
      post
        ? {
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt ?? "",
            content: post.content,
            coverImage: post.coverImage ?? "",
            lang: post.lang,
            published: post.published,
          }
        : { ...EMPTY },
    );
  }, [open, post]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) {
      toast.error(t("book_required"));
      return;
    }
    // fall back to a slug generated from the title
    const slug = (form.slug.trim() || slugify(title)) || `post-${Date.now()}`;
    setSaving(true);
    try {
      await savePost({
        ...(post ? { id: post.id } : {}),
        slug,
        title,
        excerpt: form.excerpt.trim(),
        content,
        coverImage: form.coverImage.trim(),
        lang: form.lang,
        published: form.published,
      });
      toast.success(t("admin_saved"));
      setOpen(false);
      onSaved();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg === "slug_taken" ? t("blog_slug_taken") : msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="top-0 left-0 h-dvh max-h-dvh w-full max-w-full translate-x-0 translate-y-0 overflow-x-hidden overflow-y-auto rounded-none sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[90dvh] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl">
        <DialogHeader>
          <DialogTitle>{post ? t("blog_edit") : t("blog_new")}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="bp-title">{t("blog_title_field")}</Label>
            <Input
              id="bp-title"
              value={form.title}
              onChange={(e) => {
                const v = e.target.value;
                set("title", v);
                // keep the slug in step with the title until it's edited by hand
                if (!post && !form.slug) set("slug", slugify(v));
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="bp-slug">{t("blog_slug")}</Label>
              <Input
                id="bp-slug"
                dir="ltr"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("blog_lang")}</Label>
              <Select
                value={form.lang}
                onValueChange={(v) => v && set("lang", v as Lang)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: Lang | null) => LANGS[v ?? "ckb"].label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(LANGS) as Lang[]).map((l) => (
                    <SelectItem key={l} value={l}>
                      {LANGS[l].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bp-excerpt">{t("blog_excerpt")}</Label>
            <Textarea
              id="bp-excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>{t("blog_cover")}</Label>
            <ImageUpload
              value={form.coverImage}
              onChange={(url) => set("coverImage", url)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bp-content">{t("blog_content")}</Label>
            <Textarea
              id="bp-content"
              rows={12}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("blog_content_hint")}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="bp-pub">{t("blog_publish")}</Label>
            <Switch
              id="bp-pub"
              checked={form.published}
              onCheckedChange={(v) => set("published", Boolean(v))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("admin_cancel")}
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("admin_save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
