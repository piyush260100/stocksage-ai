import { useEffect, useRef, useState } from "react";
import {
  Box,
  Chip,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { AnimatePresence, motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { answerQuery, SUGGESTIONS, type ChatMessage } from "@stock-advisor/shared";

const uid = () => Math.random().toString(36).slice(2);

const greeting: ChatMessage = {
  id: "greet",
  role: "bot",
  text: "👋 Hi, I'm Sage — your StockSage AI guide. Ask me how anything works, or tap a suggestion below.",
  timestamp: new Date().toISOString(),
};

export function HelpBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    const reply = answerQuery(trimmed);
    const botMsg: ChatMessage = {
      id: uid(),
      role: "bot",
      text: reply.answer,
      links: reply.links,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      {/* Launcher */}
      <Fab
        color="primary"
        aria-label="Open help assistant"
        onClick={() => setOpen((o) => !o)}
        sx={{ position: "fixed", bottom: 24, right: 24, zIndex: (t) => t.zIndex.drawer + 2 }}
      >
        {open ? <CloseIcon /> : <SmartToyIcon />}
      </Fab>

      <AnimatePresence>
        {open && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            sx={{
              position: "fixed",
              bottom: 92,
              right: 24,
              width: { xs: "calc(100vw - 32px)", sm: 380 },
              height: 520,
              maxHeight: "70vh",
              zIndex: (t) => t.zIndex.drawer + 2,
            }}
          >
            <Paper
              elevation={8}
              sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  background: "linear-gradient(90deg, #4f8cff22, #2ecc7122)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <SmartToyIcon color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 700, lineHeight: 1.1 }}>Sage</Typography>
                  <Typography variant="caption" color="text.secondary">
                    App guide • always here to help
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setOpen(false)} aria-label="Close">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Messages */}
              <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
                <Stack spacing={1.5}>
                  {messages.map((m) => (
                    <Box
                      key={m.id}
                      sx={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}
                    >
                      <Box
                        sx={{
                          maxWidth: "85%",
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: m.role === "user" ? "primary.main" : "background.default",
                          color: m.role === "user" ? "primary.contrastText" : "text.primary",
                          border: m.role === "bot" ? "1px solid rgba(255,255,255,0.08)" : "none",
                        }}
                      >
                        <Typography variant="body2">{m.text}</Typography>
                        {m.links && m.links.length > 0 && (
                          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                            {m.links.map((link) => (
                              <Chip
                                key={link.to}
                                label={link.label}
                                size="small"
                                color="primary"
                                variant="outlined"
                                component={RouterLink}
                                to={link.to}
                                clickable
                                onClick={() => setOpen(false)}
                              />
                            ))}
                          </Stack>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Suggestions */}
              <Box sx={{ px: 2, pb: 1 }}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {SUGGESTIONS.map((s) => (
                    <Chip key={s.label} label={s.label} size="small" onClick={() => send(s.query)} />
                  ))}
                </Stack>
              </Box>

              {/* Input */}
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                sx={{ p: 1.5, pt: 1, display: "flex", gap: 1, borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Ask about the app…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <IconButton color="primary" type="submit" aria-label="Send">
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
}
