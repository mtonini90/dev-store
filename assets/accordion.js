function coerceBoolean(value) {
  return (typeof value === "string" || !!value) && value !== "false";
}

let index = 0;

class MtAccordionHeader extends HTMLElement {
  constructor() {
    super();
    this.setAttribute("role", "button");
  }
}

customElements.define("mt-accordion-header", MtAccordionHeader);

class MtAccordionContent extends HTMLElement {
  constructor() {
    super();
    this.setAttribute("role", "region");
  }
}

customElements.define("mt-accordion-content", MtAccordionContent);

class MtAccordionItem extends HTMLElement {
  set disabled(isDisabled) {
    if (isDisabled) {
      if (!this.disabled) {
        this.setAttribute("disabled", "");
      }
    } else {
      this.removeAttribute("disabled");
    }

    this.setDisable(isDisabled);
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set expanded(isExpanded) {
    if (isExpanded) {
      if (!this.expanded) {
        this.setAttribute("expanded", "");
      }
    } else {
      this.removeAttribute("expanded");
    }

    this.setAriaExpanded(isExpanded);
  }

  get expanded() {
    return this.hasAttribute("expanded");
  }

  id = `mt-accordion-item-${index++}`;

  connectedCallback() {
    this.header = this.querySelector("mt-accordion-header");
    this.header.setAttribute("aria-controls", this.id);

    this.content = this.querySelector("mt-accordion-content");
    this.content.setAttribute("aria-labelledby", this.id);

    this.setAriaExpanded(this.expanded);
    this.setDisable(this.disabled);
  }

  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue !== newValue) this[property] = coerceBoolean(newValue);
  }

  static get observedAttributes() {
    return ["expanded", "disabled"];
  }

  setAriaExpanded(isExpanded) {
    if (this.header) this.header.setAttribute("aria-expanded", `${isExpanded}`);
  }

  setDisable(isDisabled) {
    if (this.header) {
      this.header.setAttribute("aria-disabled", `${isDisabled}`);
      this.header.setAttribute("tabindex", isDisabled ? "-1" : "0");
    }
  }
}

customElements.define("mt-accordion-item", MtAccordionItem);

const template = document.createElement("template");
template.innerHTML = `
      <style>:host {display: block;}</style>
      <slot></slot>
  `;

class MtAccordion extends HTMLElement {
  set multi(isMulti) {
    if (isMulti) {
      if (!this.multi) {
        this.setAttribute("multi", "");
      }
    } else {
      this.removeAttribute("multi");
    }
  }

  get multi() {
    return this.hasAttribute("multi");
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      template.content.cloneNode(true)
    );
  }

  connectedCallback() {
    this.contentSlot = this.shadowRoot.querySelector("slot");
    this.contentSlot.addEventListener("slotchange", this.setItems);
    this.addEventListener("click", this.toggle);
    this.addEventListener("keydown", this.keydownHandler);
  }

  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue !== newValue) this[property] = coerceBoolean(newValue);
  }

  static get observedAttributes() {
    return ["multi"];
  }

  disonnectedCallback() {
    this.contentSlot.removeEventListener("slotchange", this.setItems);
    this.removeEventListener("click", this.toggle);
    this.removeEventListener("keydown", this.keydownHandler);
  }

  setItems = (event) => {
    const items = event.target
      .assignedNodes({ flatten: true })
      .filter((el) => el.nodeType === Node.ELEMENT_NODE);

    this.items = items;
  };

  keydownHandler = (event) => {
    const code = event.code.toUpperCase();
    if (!event.repeat && (code === "SPACE" || code === "ENTER")) {
      event.preventDefault();
      this.toggle(event);
    }
  };

  toggle = (event) => {
    if (!this.disabled) {
      const header = event.target.closest("mt-accordion-header");
      if (!header) {
        return;
      }

      const id = header.getAttribute("aria-controls");
      const accordion = this.items.find((el) => el.id === id);

      if (accordion) {
        if (accordion.disabled) {
          return;
        }

        if (!this.multi) {
          this.items.forEach((item) => {
            if (item.id !== accordion.id) {
              item.expanded = false;
            }
          });
        }

        accordion.expanded = !accordion.expanded;
      }
    }
  };
}

customElements.define("mt-accordion", MtAccordion);
