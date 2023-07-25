import { useEffect, useState, useRef } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEraser, faPaintBrush, faTrashCan, faRotateLeft, faPalette, faShapes, faPlus, faMinus, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Home.module.css'


export default function Canvas() {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const [isErasing, setIsErasing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canDisableEraser, setCanDisableEraser] = useState(false);
  const [showOptions, setShowOptions] = useState({
    drawing: false,
    erasing: false,
  });
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [brush, setBrush] = useState({
    color: "#000000",
    size: 5,
    shape: 'butt',
    sprayCan: false,
  });
  const [eraser, setEraser] = useState({
    color: '#fff',
    size: 5,
    shape: 'round',
  })

  useEffect(() => {
    let timeoutId;
    if (isErasing) {
      setShowOptions({ drawing: false, erasing: true });
      timeoutId = setTimeout(() => {
        setShowOptions({ drawing: false, erasing: false });
      }, 3000);
    } else {
      setShowOptions({ drawing: true, erasing: false });
    }
    return () => clearTimeout(timeoutId);
  }, [isErasing]);

  const handleOptions = () => {
    if (isErasing) {
      setShowOptions({ drawing: false, erasing: true });
    } else {
      setShowOptions({ drawing: true, erasing: false });
    }
  }
  
  const handleMouseDown = (e) => {
    setIsDrawing(!isDrawing);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;
    setLastX(x);
    setLastY(y);
    context.beginPath();
    context.moveTo(x, y);
  };

  const handleMouseUp = () => {
     if (e.button === 0) {
      setIsDrawing(false);
    } else if (e.button === 2) {
      setIsErasing(false);
      canvasRef.current.isErasing = false;
    }
    cancelAnimationFrame(animationRef.current);
  };

  const handleMouseMovement = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;
    const dx = x - lastX;
    const dy = y - lastY;

    if (isErasing) {
      context.strokeStyle = '#FFFFFF';
      context.lineWidth = eraser.size;
      context.lineCap = eraser.shape;
      context.lineJoin = 'miter';
      context.lineTo(x, y);
      context.stroke();
    } else {
      context.strokeStyle = brush.color;
      context.lineWidth = brush.size;
      context.lineCap = brush.shape;
      context.lineJoin = 'round';
      context.lineTo(x, y);
      context.stroke();
    }
    setLastX(x);
    setLastY(y);
    const currentState = context.getImageData(0, 0, canvas.width, canvas.height);
    animationRef.current = requestAnimationFrame(() => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.putImageData(currentState, 0, 0);
    });
  }

  const EraserButton = ({ isErasing, canDisableEraser, onClick }) => {
    const handleClick = () => {
      if (isErasing && !canDisableEraser) {
        return;
      }
      onClick();
    };
    return <button className={styles.button} onClick={() => {
      setIsErasing(true);
      handleClick();
      handleOptions();
    }
    }><FontAwesomeIcon icon={faEraser} /><FontAwesomeIcon icon={faCaretRight} className={styles.caretIcon} /></button>;
  };

  const DisableEraserButton = ({ onClick }) => {
    return <button className={styles.button} onClick={() => {
      setIsErasing(false);
      onClick();
      handleOptions();
    }
  }><FontAwesomeIcon icon={faPaintBrush} /><FontAwesomeIcon icon={faCaretRight} className={styles.caretIcon} /></button>;
  };

  const handleEraserClick = () => {
    setIsErasing(!isErasing)
    setCanDisableEraser(true);
  };
  const handleEnablePencil = () => {
    setIsErasing(false);
    setCanDisableEraser(false);
  };

  const handleColorChange = (e) => {
    setBrush({ ...brush, color: e.target.value });
  };

  const handleSizeChange = (e) => {
    setBrush({ ...brush, size: e.target.value });
  };

  const handleBrushChange = (e) => {
    setBrush({ ...brush, shape: e.target.value});
  };

  const handleEraserSizeChange = (e) => {
    setEraser({ ...eraser, size: e.target.value});
  };

return (
    <div className={styles.container}>
      <h1>Sketch</h1>
      <div className={styles.canvasContainer}>
        <CanvasDraw
          className={styles.canvasDraw}
          ref={canvasRef}
          brushColor={!isErasing ? brush.color : eraser.color}
          brushRadius={!isErasing ? brush.size : eraser.size}
          brushShape={brush.shape}
          brush={brush.sprayCan ? SprayCanBrush : undefined}
          canvasWidth={800}
          canvasHeight={600}
          lazyRadius={0}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMovement}
          onMouseUp={handleMouseUp}
          onMouseOut={handleMouseUp}
          hideGrid
          onPointerDown={() => setIsErasing(false)}
        />
        <div className={styles.controls}>
          <div className={styles.buttonContainer}>
          <DisableEraserButton onClick={handleEnablePencil} />
            {showOptions.drawing ? <div className={styles.brushOptions}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel} htmlFor="brush-size"><FontAwesomeIcon icon={faMinus} /></label>
                <input
                  className={styles.controlInput}
                  type="range"
                  id="brush-size"
                  min={1}
                  max={50}
                  value={brush.size}
                  onChange={handleSizeChange}
                />
                <FontAwesomeIcon icon={faPlus} />
                <span>{brush.size} px</span>
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel} htmlFor="brush-color"><FontAwesomeIcon icon={faPalette} /></label>
                <input
                  className={styles.controlInput}
                  type="color"
                  id="brush-color"
                  value={brush.color}
                  onChange={handleColorChange}
                />
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel} htmlFor="brush-shape"><FontAwesomeIcon icon={faShapes} /></label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.select}
                    id="brush-shape"
                    value={brush.shape}
                    onChange={handleBrushChange}
                  >
                    <option value="round">Round</option>
                    <option value="square">Square</option>
                    <option value="spray">Spray</option>
                  </select>
                </div>
              </div>
            </div> : null}
          </div>
          <div className={styles.buttonContainer}>
            <EraserButton
              isErasing={isErasing}
              canDisableEraser={canDisableEraser}
              onClick={handleEraserClick}
            />
            {showOptions.erasing ? 
            <div className={styles.brushOptions}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel} htmlFor="eraser-size"><FontAwesomeIcon icon={faMinus} /></label>
                <input
                  className={styles.controlInput}
                  type="range"
                  id="eraser-size"
                  min={1}
                  max={50}
                  value={eraser.size}
                  onChange={handleEraserSizeChange}
                /><FontAwesomeIcon icon={faPlus} />
                <span>{eraser.size} px</span>
              </div>
            </div> : null}
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.button} onClick={() => canvasRef.current.undo()}><FontAwesomeIcon icon={faRotateLeft} /></button>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.button}  onClick={() => canvasRef.current.clear()}><FontAwesomeIcon icon={faTrashCan} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
