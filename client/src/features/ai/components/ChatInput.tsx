import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';
import { AI_LIMITS } from '@/features/ai/config/limits';

type ChatInputProps = {
  /** True while an answer is on its way. */
  isDisabled: boolean;
  /** Returns true when the message was sent (the input is cleared); false keeps the text. */
  onSend: (text: string) => boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
};

/**
 * Message box. Enter sends, Shift+Enter inserts a new line, and Enter while an IME composes (for
 * example Arabic or Japanese input) is left to the IME. The typed text lives here, so it survives
 * closing the drawer (the drawer stays mounted).
 */
export function ChatInput({ isDisabled, onSend, inputRef }: ChatInputProps) {
  const [value, setValue] = useState('');
  const wasDisabledRef = useRef(false);

  // A disabled input loses focus: give it back when the answer arrives, unless the user moved on.
  useEffect(() => {
    const input = inputRef.current;
    const active = document.activeElement;
    const hasLostFocus = active === null || active === document.body || active === input;
    if (wasDisabledRef.current && !isDisabled && hasLostFocus) input?.focus();
    wasDisabledRef.current = isDisabled;
  }, [isDisabled, inputRef]);

  const submit = () => {
    if (onSend(value)) setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}
    >
      <OutlinedInput
        fullWidth
        multiline
        minRows={1}
        maxRows={5}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        placeholder="Ask about your project…"
        inputRef={inputRef}
        inputProps={{ 'aria-label': 'Message', maxLength: AI_LIMITS.messageMax, dir: 'auto' }}
      />
      <Tooltip title="Send message">
        <span>
          <IconButton
            type="submit"
            color="primary"
            aria-label="Send message"
            disabled={isDisabled || value.trim() === ''}
          >
            <SendIcon aria-hidden="true" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
