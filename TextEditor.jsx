// src/TextEditor.js
import React, { useRef, useState, useEffect } from 'react';
import {
  BoldIcon,
  CircleBullet,
  ItalicIcon,
  UnderlineIcon,
  ClipIcon,
  CodeBlockIcon,
  DropDownArrowIcon,
  NumberListIcon,
  StrikeThroughIcon,
} from "../../../public/assets/text-editor/index";
import { BiAlignLeft, BiAlignCenter, BiAlignRight, BiAlignJustify } from 'react-icons/bi';
import { IoMdSquare } from "react-icons/io";
import { PiTextAlignJustifyLight, PiTextAlignLeftLight, PiTextAlignRightLight, PiTextAlignCenterLight } from "react-icons/pi";

const TextEditor = () => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showAlignDropdown, setShowAlignDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showTextTypeDropdown, setShowTextTypeDropdown] = useState(false);
  const [activeFormats, setActiveFormats] = useState([]);
  const [textColor, setTextColor] = useState('#000000');

  // Function to execute formatting commands
  const formatText = (command, value = null) => {
    editorRef.current.focus();
    if (command === 'foreColor') {
      document.execCommand(command, false, value);
      setTextColor(value);
    } else if (command === 'align') {
      applyAlignment(value);
    } else {
      document.execCommand(command, false, value);
    }
    updateActiveFormats();
  };

  // Function to apply alignment
  const applyAlignment = (alignment) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let block = range.startContainer;

      // Traverse up to find the block-level element
      while (block && block !== editorRef.current && !(block instanceof HTMLElement && ['DIV', 'P', 'H1', 'H2', 'LI'].includes(block.nodeName))) {
        block = block.parentNode;
      }

      if (block && block !== editorRef.current && block.style) {
        block.style.textAlign = alignment;
      } else {
        // If no block-level element found, wrap the selection in a div with alignment
        const div = document.createElement('div');
        div.style.textAlign = alignment;
        try {
          range.surroundContents(div);
        } catch (e) {
          console.error('Alignment failed:', e);
        }
      }
    }
  };

  // Function to insert lists
  const insertList = (type) => {
    editorRef.current.focus();
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedContent = range.extractContents();

    const list = document.createElement(type === 'ordered' ? 'ol' : 'ul');
    const listItem = document.createElement('li');
    listItem.appendChild(selectedContent);
    list.appendChild(listItem);

    range.insertNode(list);
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(listItem);
    selection.addRange(newRange);
  };

  // Function to apply headings
  const applyHeading = (headingType) => {
    editorRef.current.focus();
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedContent = range.extractContents();

    const heading = document.createElement(headingType);
    heading.className = headingType === 'h1' ? 'text-2xl font-bold' : headingType === 'h2' ? 'text-xl font-bold' : 'text-sm font-normal';
    heading.appendChild(selectedContent);

    range.insertNode(heading);
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(heading);
    selection.addRange(newRange);
  };


  // Update active formats
  const updateActiveFormats = () => {
    const formats = [];
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    if (document.queryCommandState('strikeThrough')) formats.push('strikeThrough');
    setActiveFormats(formats);
  };

  // Update formats when selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveFormats();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const isActive = (format) => activeFormats.includes(format);

  // Color options
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FFA500', '#800080', '#008080', '#FFC0CB', '#A52A2A',
  ];

  const ThinLine = () => {
    return <div className="h-7 mx-1 bg-[#DFE4EA] w-px "></div>;
  };

  // Handle file attachment
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Insert the image into the editor
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = file.name;
        // Insert image at the cursor position
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.insertNode(img);
          // Move the cursor after the image
          range.setStartAfter(img);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          editorRef.current.appendChild(img);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 border rounded-lg shadow-md">
      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 outline-none"
        suppressContentEditableWarning={true}
      ></div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Toolbar at the Bottom */}
      <div className="relative flex flex-wrap justify-start p-1 rounded-b-lg items-center text-[13px] bg-[#F9FAFB] border-t ">
        {/* Text Type Dropdown */}
        <div className="relative m-1">
          <button
            onClick={() => setShowTextTypeDropdown(!showTextTypeDropdown)}
            className="flex  items-center p-1   rounded hover:bg-gray-200"
            aria-label="Text Type"
          >
            <span className="mr-1"> Normal Text</span>
            <DropDownArrowIcon />
          </button>
          {showTextTypeDropdown && (
            <div
              className="absolute left-0 z-10 w-40 mt-2 bg-white border rounded shadow transition-all"
            >
              <button
                onClick={() => {
                  applyHeading('p');
                  setShowTextTypeDropdown(false);
                }}
                className="block w-full px-4 py-2 text-left hover:bg-gray-200"
              >
                Normal Text
              </button>
              <button
                onClick={() => {
                  applyHeading('h1');
                  setShowTextTypeDropdown(false);
                }}
                className="block w-full px-4 py-2 text-left hover:bg-gray-200"
              >
                Heading 1
              </button>
              <button
                onClick={() => {
                  applyHeading('h2');
                  setShowTextTypeDropdown(false);
                }}
                className="block w-full px-4 py-2 text-left hover:bg-gray-200"
              >
                Heading 2
              </button>
            </div>
          )}
        </div>
        <ThinLine />

        {/* Alignment Dropdown */}
        <div className="relative ">
          <button
            onClick={() => setShowAlignDropdown(!showAlignDropdown)}
            className="flex items-center p-1 text-lg  rounded hover:bg-gray-200"
            aria-label="Alignment"
          >
            <PiTextAlignLeftLight />
            <DropDownArrowIcon />
          </button>
          {showAlignDropdown && (
            <div
              className="absolute left-0 z-10 text-lg w-22 mt-2 bg-white border rounded shadow transition-all"
            >
              <button
                onClick={() => {
                  formatText('align', 'left');
                  setShowAlignDropdown(false);
                }}
                className="flex items-center w-full px-2 py-2 hover:bg-gray-200"
              >
               
                <PiTextAlignLeftLight />
              </button>
              <button
                onClick={() => {
                  formatText('align', 'center');
                  setShowAlignDropdown(false);
                }}
                className="flex items-center w-full px-2 py-2 hover:bg-gray-200"
              >
             
                <PiTextAlignCenterLight />
              </button>
              <button
                onClick={() => {
                  formatText('align', 'right');
                  setShowAlignDropdown(false);
                }}
                className="flex items-center w-full px-2 py-2 hover:bg-gray-200"
              >
        
                <PiTextAlignRightLight />
              </button>
              <button
                onClick={() => {
                  formatText('align', 'justify');
                  setShowAlignDropdown(false);
                }}
                className="flex items-center w-full px-2 py-2 hover:bg-gray-200"
              >
                <PiTextAlignJustifyLight />
              </button>
            </div>
          )}
        </div>
        <ThinLine />

        {/* Text Color Dropdown */}
        <div className="relative ">
          <button
            onClick={() => setShowColorDropdown(!showColorDropdown)}
            className="flex items-center p-1 text-lg  rounded hover:bg-gray-200"
            aria-label="Text Color"
          >
            <IoMdSquare style={{ color: textColor }} />
            <DropDownArrowIcon />
          </button>
          {showColorDropdown && (
            <div
              className="absolute left-0 z-10 grid w-40 grid-cols-5 gap-2 p-2 mt-2 bg-white border rounded shadow transition-all"
            >
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    formatText('foreColor', color);
                    setShowColorDropdown(false);
                  }}
                  className="w-6 h-6 rounded-sm"
                  style={{ backgroundColor: color }}
                ></button>
              ))}
            </div>
          )}
        </div>
        <ThinLine />
        {/* Attachment Clip */}
        <button
          onClick={() => fileInputRef.current.click()}
          className=" p-1 text-lg  rounded hover:bg-gray-200"
          aria-label="Attach File"
        >
          <ClipIcon />
        </button>

        {/* Bold */}
        <button
          onClick={() => formatText('bold')}
          className={` p-1 text-xl   rounded hover:bg-gray-200 ${isActive('bold') ? 'bg-gray-300' : ''
            }`}
          aria-label="Bold"
        >
          <BoldIcon />
        </button>

        {/* Italic */}
        <button
          onClick={() => formatText('italic')}
          className={` p-1 text-lg  rounded hover:bg-gray-200 ${isActive('italic') ? 'bg-gray-300' : ''
            }`}
          aria-label="Italic"
        >
          <ItalicIcon />
        </button>

        {/* Underline */}
        <button
          onClick={() => formatText('underline')}
          className={` p-1 text-lg  hover:bg-gray-200 ${isActive('underline') ? 'bg-gray-300' : ''
            }`}
          aria-label="Underline"
        >
          <UnderlineIcon />
        </button>

        {/* Strikethrough */}
        <button
          onClick={() => formatText('strikeThrough')}
          className={` p-1 text-lg  hover:bg-gray-200 ${isActive('strikeThrough') ? 'bg-gray-300' : ''
            }`}
          aria-label="Strikethrough"
        >
          <StrikeThroughIcon />
        </button>

        {/* Bullet List */}
        <button
          onClick={() => insertList('unordered')}
          className=" p-1 text-lg rounded hover:bg-gray-200"
          aria-label="Bullet List"
        >
          <CircleBullet />
        </button>

        {/* Numbered List */}
        <button
          onClick={() => insertList('ordered')}
          className=" p-1 text-lg rounded hover:bg-gray-200"
          aria-label="Numbered List"
        >
          <NumberListIcon />
        </button>

        {/* Code Block */}
        <button
          onClick={() => applyHeading('pre')}
          className=" p-1 text-lg rounded hover:bg-gray-200"
          aria-label="Code Block"
        >
          <CodeBlockIcon />
        </button>
      </div>
    </div>
  );
};

export default TextEditor;
