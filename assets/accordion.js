let index = 0;

class MtAccordionHeader extends HTMLElement {
  constructor() {
    super();
    this.setAttribute("role", "button");
  }

  static get getSelector() {
    return "mt-accordion-header";
  }
}

customElements.define(MtAccordionHeader.getSelector, MtAccordionHeader);

class MtAccordionContent extends HTMLElement {
  constructor() {
    super();
    this.setAttribute("role", "region");
  }

  static get getSelector() {
    return "mt-accordion-content";
  }
}

customElements.define(MtAccordionContent.getSelector, MtAccordionContent);

class MtAccordionItem extends HTMLElement {
  set disabled(isDisabled) {
    if (isDisabled) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set expanded(isExpanded) {
    if (isExpanded) {
      this.setAttribute("expanded", "");
    } else {
      this.removeAttribute("expanded");
    }
  }

  get expanded() {
    return this.hasAttribute("expanded");
  }

  _id = `${MtAccordionItem.getSelector}-${index++}`;

  connectedCallback() {
    this.header = this.querySelector(MtAccordionHeader.getSelector);
    this.header.setAttribute("aria-controls", this._id);

    this.content = this.querySelector(MtAccordionContent.getSelector);
    this.content.setAttribute("aria-labelledby", this._id);

    this.setAriaExpanded(this.expanded);
    this.setDisable(this.disabled);
  }

  attributeChangedCallback(property, oldValue, newValue) {
    const value = newValue !== null;
    switch (property) {
      case "disabled":
        this.setDisable(value);
        break;
      case "expanded":
        this.setAriaExpanded(value);
        break;
      default:
        break;
    }
  }

  static get observedAttributes() {
    return ["expanded", "disabled"];
  }

  setAriaExpanded(isExpanded) {
    if (this.header) this.header.setAttribute("aria-expanded", isExpanded);
  }

  setDisable(isDisabled) {
    if (this.header) {
      this.header.setAttribute("aria-disabled", isDisabled);
      this.header.setAttribute("tabindex", isDisabled ? "-1" : "0");
    }
  }

  static get getSelector() {
    return "mt-accordion-item";
  }
}

customElements.define(MtAccordionItem.getSelector, MtAccordionItem);

const template = document.createElement("template");
template.innerHTML = `
        <style>:host {display: block;}</style>
        <slot></slot>
    `;

class MtAccordion extends HTMLElement {
  set multi(isMulti) {
    if (isMulti) {
      this.setAttribute("multi", "");
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
      const header = event.target.closest(MtAccordionHeader.getSelector);
      if (!header) {
        return;
      }

      const item = header.closest(MtAccordionItem.getSelector);
      const accordion = this.items.find((el) => el === item);

      if (accordion) {
        if (accordion.disabled) {
          return;
        }

        if (!this.multi) {
          this.items.forEach((item) => {
            if (item._id !== accordion._id) {
              item.expanded = false;
            }
          });
        }

        accordion.expanded = !accordion.expanded;
      }
    }
  };

  static get getSelector() {
    return "mt-accordion";
  }
}

customElements.define(MtAccordion.getSelector, MtAccordion);
