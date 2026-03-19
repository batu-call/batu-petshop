"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  Save,
  GripVertical,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";
import { useConfirm } from "@/app/Context/confirmContext";

type Item = { _id?: string; text: string };
type Section = { _id?: string; title: string; items: Item[] };

const tempId = () => `tmp_${Math.random().toString(36).slice(2, 9)}`;

const normalizeSections = (sections: Section[]): Section[] =>
  sections.map((s) => ({
    ...s,
    _id: s._id ?? tempId(),
    items: s.items.map((i) => ({ ...i, _id: i._id ?? tempId() })),
  }));

const stripTempIds = (sections: Section[]) =>
  sections.map(({ _id, items, ...rest }) => ({
    ...rest,
    ...(_id && !_id.startsWith("tmp_") ? { _id } : {}),
    items: items.map(({ _id: iid, ...irest }) => ({
      ...irest,
      ...(iid && !iid.startsWith("tmp_") ? { _id: iid } : {}),
    })),
  }));

//  Add Item Row
const AddItemRow = ({ onAdd }: { onAdd: (text: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  const handleSubmit = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
    setOpen(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setValue("");
      setOpen(false);
    }
  };

  if (!open)
    return (
      <button
        onClick={handleOpen}
        className="mt-2 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed border-slate-200 dark:border-[#2d5a3d] text-slate-400 dark:text-[#7aab8a] hover:border-[#97cba9] hover:text-[#0b8457] dark:hover:border-[#0b8457] dark:hover:text-[#97cba9] transition-all text-sm font-medium group cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
        Add new item
      </button>
    );

  return (
    <div className="mt-2 rounded-xl border-2 border-[#97cba9] dark:border-[#0b8457] bg-[#f4f9f6] dark:bg-[#0d1f18] overflow-hidden shadow-sm">
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[10px] font-semibold text-[#7aab8a] uppercase tracking-widest mb-1.5">
          New item
        </p>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Type the item text… (Enter to add, Shift+Enter for new line, Esc to cancel)"
          className="w-full bg-transparent text-sm text-[#393E46] dark:text-[#c8e6d0] placeholder:text-slate-400 dark:placeholder:text-[#3d6b50] resize-none outline-none leading-relaxed"
        />
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-t border-[#97cba9]/30 dark:border-[#0b8457]/30">
        <span className="text-[10px] text-slate-400 dark:text-[#3d6b50]">
          {value.length} chars
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setValue("");
              setOpen(false);
            }}
            className="px-3 py-1 text-xs font-semibold text-slate-500 dark:text-[#7aab8a] hover:bg-slate-100 dark:hover:bg-[#1e3d2a] rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-40 transition-colors cursor-pointer"
          >
            Add <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

//  Add Section Row
const AddSectionRow = ({ onAdd }: { onAdd: (title: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  const handleSubmit = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
    setOpen(false);
  };

  if (!open)
    return (
      <button
        onClick={handleOpen}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-[#97cba9]/50 dark:border-[#2d5a3d] text-[#0b8457] dark:text-[#97cba9] hover:border-[#97cba9] dark:hover:border-[#0b8457] hover:bg-[#97cba9]/5 transition-all flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Add New Section
      </button>
    );

  return (
    <div className="w-full rounded-2xl border-2 border-[#97cba9] dark:border-[#0b8457] bg-white dark:bg-[#162820] overflow-hidden shadow-sm">
      <div className="px-6 pt-5 pb-3">
        <p className="text-xs font-semibold text-[#7aab8a] uppercase tracking-widest mb-3">
          New section
        </p>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") {
              setValue("");
              setOpen(false);
            }
          }}
          placeholder="Section title (e.g. Exchange Policy, Warranty…)"
          className="w-full text-base font-bold bg-transparent text-[#162820] dark:text-[#c8e6d0] outline-none placeholder:font-normal placeholder:text-slate-300 dark:placeholder:text-[#3d6b50]"
        />
      </div>
      <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-[#97cba9]/30 dark:border-[#0b8457]/30">
        <button
          onClick={() => {
            setValue("");
            setOpen(false);
          }}
          className="px-4 py-1.5 text-sm font-semibold text-slate-500 dark:text-[#7aab8a] hover:bg-slate-100 dark:hover:bg-[#1e3d2a] rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Create Section
        </button>
      </div>
    </div>
  );
};

// ── Main Component
const ShippingContentAdmin = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [dragItem, setDragItem] = useState<{
    sectionId: string;
    itemId: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState<{
    sectionId: string;
    itemId: string;
  } | null>(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shipping/content`,
          { withCredentials: true },
        );
        if (res.data.success && res.data.data?.sections?.length > 0) {
          setSections(normalizeSections(res.data.data.sections));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    const hasEmpty = sections.some((s) =>
      s.items.some((i) => i.text.trim() === ""),
    );
    if (hasEmpty) {
      toast.error("Please fill in all empty items before saving.");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shipping/content`,
        { sections: stripTempIds(sections) },
        { withCredentials: true },
      );
      if (res.data.success) {
        setSections(normalizeSections(res.data.data.sections));
        toast.success("Content saved successfully!");
      }
    } catch {
      toast.error("Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: "Clear All Content?",
      description: "All sections and items will be deleted. Are you sure?",
      confirmText: "Yes, Clear",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    setSections([]);
    toast("Cleared all content", { icon: "🗑️" });
  };

  const updateItem = (sId: string, iId: string, text: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s._id !== sId
          ? s
          : {
              ...s,
              items: s.items.map((i) => (i._id !== iId ? i : { ...i, text })),
            },
      ),
    );

  const addItem = (sId: string, text: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s._id !== sId
          ? s
          : { ...s, items: [...s.items, { _id: tempId(), text }] },
      ),
    );

  const removeItem = async (sId: string, iId: string, text: string) => {
    const ok = await confirm({
      title: "Delete Item?",
      description: `"${text.length > 60 ? text.slice(0, 60) + "…" : text}"`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    setSections((prev) =>
      prev.map((s) =>
        s._id !== sId
          ? s
          : { ...s, items: s.items.filter((i) => i._id !== iId) },
      ),
    );
  };

  const addSection = (title: string) =>
    setSections((prev) => [...prev, { _id: tempId(), title, items: [] }]);

  const removeSection = async (sId: string, title: string) => {
    const ok = await confirm({
      title: `Delete "${title}"?`,
      description:
        "This will permanently remove the entire section and all its items.",
      confirmText: "Delete Section",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    setSections((prev) => prev.filter((s) => s._id !== sId));
  };

  const updateSectionTitle = (sId: string, title: string) =>
    setSections((prev) =>
      prev.map((s) => (s._id !== sId ? s : { ...s, title })),
    );

  const handleDragStart = (sId: string, iId: string) =>
    setDragItem({ sectionId: sId, itemId: iId });

  const handleDragOver = (e: React.DragEvent, sId: string, iId: string) => {
    e.preventDefault();
    setDragOver({ sectionId: sId, itemId: iId });
  };

  const handleDrop = (targetSId: string, targetIId: string) => {
    if (!dragItem || dragItem.sectionId !== targetSId) {
      setDragItem(null);
      setDragOver(null);
      return;
    }
    setSections((prev) =>
      prev.map((s) => {
        if (s._id !== targetSId) return s;
        const items = [...s.items];
        const fromIdx = items.findIndex((i) => i._id === dragItem.itemId);
        const toIdx = items.findIndex((i) => i._id === targetIId);
        const [moved] = items.splice(fromIdx, 1);
        items.splice(toIdx, 0, moved);
        return { ...s, items };
      }),
    );
    setDragItem(null);
    setDragOver(null);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#f4f9f6] dark:bg-[#0d1f18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#97cba9] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#7aab8a]">Loading content...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f4f9f6] dark:bg-[#0d1f18] p-4 md:p-8 font-[Jost,sans-serif]">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#162820] dark:text-[#c8e6d0]">
              Page Content Editor
            </h1>
            <p className="text-sm text-[#7aab8a] mt-1">
              Manage the Shipping & Returns page visible to customers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            >
              {preview ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {preview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-white/10 text-slate-500 dark:text-[#7aab8a] hover:bg-slate-100 dark:hover:bg-[#1e3d2a] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Clear All
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save All"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {preview ? (
          <div className="bg-white dark:bg-[#162820] rounded-2xl border border-slate-200 dark:border-white/10 p-8">
            <p className="text-xs font-semibold text-[#7aab8a] uppercase tracking-widest mb-6">
              Customer Preview
            </p>
            {sections.length === 0 && (
              <p className="text-sm text-slate-400 italic text-center py-8">
                No content yet. Add sections below.
              </p>
            )}
            {sections.map((section) => (
              <div key={section._id} className="mb-10">
                <h2 className="text-2xl font-bold text-[#B1CBBB] dark:text-[#0E5F44] border-b-2 border-[#B1CBBB] dark:border-[#0E5F44] pb-3 mb-5 text-center">
                  {section.title}
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  {section.items.map((item) => (
                    <li
                      key={item._id}
                      className="text-[#393E46] dark:text-[#0b8457] text-base leading-relaxed"
                    >
                      {item.text.trim() !== "" ? (
                        item.text
                      ) : (
                        <span className="text-red-400 italic">Empty item</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <>
            {sections.length === 0 && (
              <div className="text-center py-12 text-slate-400 dark:text-[#7aab8a] text-sm italic">
                No sections yet. Use the button below to add one.
              </div>
            )}
            {sections.map((section) => (
              <div
                key={section._id}
                className="bg-white dark:bg-[#162820] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
              >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#0d1f18]/50">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSectionTitle(section._id!, e.target.value)
                    }
                    className="flex-1 text-base font-bold bg-transparent text-[#162820] dark:text-[#c8e6d0] border-none outline-none focus:ring-0 placeholder:text-slate-400"
                    placeholder="Section title..."
                  />
                  <span className="text-xs text-[#7aab8a] bg-[#97cba9]/20 dark:bg-[#0b8457]/20 px-2 py-0.5 rounded-full font-medium">
                    {section.items.length} items
                  </span>
                  <button
                    onClick={() => removeSection(section._id!, section.title)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 space-y-2">
                  {section.items.length === 0 && (
                    <p className="text-sm text-slate-400 dark:text-[#7aab8a] text-center py-4 italic">
                      No items yet. Add one below.
                    </p>
                  )}
                  {section.items.map((item, idx) => (
                    <div
                      key={item._id}
                      draggable
                      onDragStart={() =>
                        handleDragStart(section._id!, item._id!)
                      }
                      onDragOver={(e) =>
                        handleDragOver(e, section._id!, item._id!)
                      }
                      onDrop={() => handleDrop(section._id!, item._id!)}
                      className={`flex items-center gap-2 rounded-lg transition-all ${dragOver?.sectionId === section._id && dragOver?.itemId === item._id ? "ring-2 ring-[#97cba9] bg-[#97cba9]/5" : ""}`}
                    >
                      <div className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-[#2d5a3d] hover:text-[#97cba9] transition-colors flex-shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-slate-400 dark:text-[#7aab8a] w-5 text-right flex-shrink-0">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          updateItem(section._id!, item._id!, e.target.value)
                        }
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors text-[#393E46] dark:text-[#c8e6d0] bg-slate-50 dark:bg-[#1e3d2a] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent outline-none ${item.text.trim() === "" ? "border-red-300 dark:border-red-700" : "border-slate-200 dark:border-white/10"}`}
                        placeholder="Enter item text..."
                      />
                      <button
                        onClick={() =>
                          removeItem(section._id!, item._id!, item.text)
                        }
                        className="p-2 text-red-300 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <AddItemRow onAdd={(text) => addItem(section._id!, text)} />
                </div>
              </div>
            ))}
            <AddSectionRow onAdd={addSection} />
          </>
        )}

        {!preview && (
          <div className="flex justify-end pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-lg cursor-pointer"
            >
              <Save className="w-4 h-4" />{" "}
              {saving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingContentAdmin;
